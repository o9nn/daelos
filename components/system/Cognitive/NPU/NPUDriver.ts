/**
 * NPU Driver - Neural Processing Unit Driver
 * 
 * Provides a unified MMIO-style interface for LLM inference operations.
 * Supports multiple backends: WebLLM, Prompt API, External API.
 * 
 * Based on the NPU.md specification from the daegent project.
 */

import {
  NPU_REGISTERS,
  NPUCommand,
  NPUStatus,
  DEFAULT_INFERENCE_CONFIG,
  type InferenceBackend,
  type InferenceConfig,
  type InferenceRequest,
  type InferenceResponse,
  type ModelInfo,
  type NPUTelemetry,
  type NPUEvent,
  type NPUEventListener,
  type NPUEventType,
  type NPUDriverState,
  type TokenStreamEvent,
  type InferenceBackendType,
} from "./types";

import { WebLLMBackend } from "./backends/WebLLMBackend";
import { PromptAPIBackend } from "./backends/PromptAPIBackend";

/**
 * NPU Driver Singleton
 * 
 * Manages LLM inference with hardware-style MMIO interface.
 */
export class NPUDriver {
  private static instance: NPUDriver | null = null;
  
  // MMIO Registers (SharedArrayBuffer for cross-worker communication)
  private registers: Int32Array;
  private registerBuffer: SharedArrayBuffer;
  
  // Backends
  private backends: Map<InferenceBackendType, InferenceBackend> = new Map();
  private activeBackend: InferenceBackend | null = null;
  
  // State
  private state: NPUDriverState;
  
  // Event system
  private eventListeners: Map<NPUEventType, Set<NPUEventListener>> = new Map();
  
  // Prompt buffer
  private promptBuffer: string = '';
  private systemPromptBuffer: string = '';
  
  // Output buffer
  private outputBuffer: string[] = [];
  private outputIndex = 0;
  
  private constructor() {
    // Initialize SharedArrayBuffer for registers
    this.registerBuffer = new SharedArrayBuffer(32); // 8 registers * 4 bytes
    this.registers = new Int32Array(this.registerBuffer);
    
    // Initialize state
    this.state = {
      status: NPUStatus.STATUS_IDLE,
      currentModel: null,
      config: { ...DEFAULT_INFERENCE_CONFIG },
      telemetry: this.createEmptyTelemetry(),
      backend: 'webllm',
      isInitialized: false,
    };
    
    // Initialize registers
    this.writeRegister(NPU_REGISTERS.REG_STATUS, NPUStatus.STATUS_IDLE);
    this.writeRegister(NPU_REGISTERS.REG_CMD, NPUCommand.CMD_NOP);
    this.writeRegister(NPU_REGISTERS.REG_ERROR, 0);
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): NPUDriver {
    if (!NPUDriver.instance) {
      NPUDriver.instance = new NPUDriver();
    }
    return NPUDriver.instance;
  }
  
  /**
   * Initialize the NPU driver and backends
   */
  async initialize(): Promise<void> {
    if (this.state.isInitialized) return;
    
    console.log('NPU Driver: Initializing...');
    
    // Initialize backends
    const webllmBackend = new WebLLMBackend();
    const promptApiBackend = new PromptAPIBackend();
    
    await Promise.all([
      webllmBackend.initialize(),
      promptApiBackend.initialize(),
    ]);
    
    // Register available backends
    if (webllmBackend.isAvailable) {
      this.backends.set('webllm', webllmBackend);
      console.log('NPU Driver: WebLLM backend available');
    }
    
    if (promptApiBackend.isAvailable) {
      this.backends.set('prompt-api', promptApiBackend);
      console.log('NPU Driver: Prompt API backend available');
    }
    
    // Select best available backend
    if (this.backends.has('webllm')) {
      this.activeBackend = this.backends.get('webllm')!;
      this.state.backend = 'webllm';
    } else if (this.backends.has('prompt-api')) {
      this.activeBackend = this.backends.get('prompt-api')!;
      this.state.backend = 'prompt-api';
    }
    
    this.state.isInitialized = true;
    this.emitEvent('status-change', { status: 'initialized' });
    
    console.log(`NPU Driver: Initialized with ${this.state.backend} backend`);
  }
  
  /**
   * Write to MMIO register
   */
  writeRegister(address: number, value: number): void {
    const index = address / 4;
    Atomics.store(this.registers, index, value);
    Atomics.notify(this.registers, index);
  }
  
  /**
   * Read from MMIO register
   */
  readRegister(address: number): number {
    const index = address / 4;
    return Atomics.load(this.registers, index);
  }
  
  /**
   * Execute NPU command
   */
  async executeCommand(command: NPUCommand): Promise<void> {
    this.writeRegister(NPU_REGISTERS.REG_CMD, command);
    
    switch (command) {
      case NPUCommand.CMD_RESET:
        await this.handleReset();
        break;
        
      case NPUCommand.CMD_LOAD_MODEL:
        await this.handleLoadModel();
        break;
        
      case NPUCommand.CMD_UNLOAD_MODEL:
        await this.handleUnloadModel();
        break;
        
      case NPUCommand.CMD_LOAD_PROMPT:
        this.handleLoadPrompt();
        break;
        
      case NPUCommand.CMD_START_INF:
        await this.handleStartInference();
        break;
        
      case NPUCommand.CMD_STOP_INF:
        this.handleStopInference();
        break;
        
      case NPUCommand.CMD_READ_TOKEN:
        this.handleReadToken();
        break;
        
      case NPUCommand.CMD_GET_TELEMETRY:
        this.handleGetTelemetry();
        break;
        
      case NPUCommand.CMD_SET_CONFIG:
        this.handleSetConfig();
        break;
    }
  }
  
  /**
   * High-level inference API
   */
  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    if (!this.activeBackend) {
      throw new Error('No inference backend available');
    }
    
    this.setStatus(NPUStatus.STATUS_BUSY | NPUStatus.STATUS_GENERATING);
    this.emitEvent('status-change', { status: 'generating' });
    
    try {
      const response = await this.activeBackend.generate(request);
      
      this.setStatus(NPUStatus.STATUS_IDLE | NPUStatus.STATUS_EOG);
      this.emitEvent('inference-complete', { response });
      
      // Update telemetry
      this.state.telemetry = this.activeBackend.getTelemetry();
      this.emitEvent('telemetry-update', { telemetry: this.state.telemetry });
      
      return response;
    } catch (error) {
      this.setStatus(NPUStatus.STATUS_ERROR);
      this.writeRegister(NPU_REGISTERS.REG_ERROR, 1);
      this.emitEvent('error', { error });
      throw error;
    }
  }
  
  /**
   * Streaming inference API
   */
  async *inferStream(request: InferenceRequest): AsyncGenerator<TokenStreamEvent> {
    if (!this.activeBackend) {
      throw new Error('No inference backend available');
    }
    
    this.setStatus(NPUStatus.STATUS_BUSY | NPUStatus.STATUS_GENERATING);
    this.emitEvent('status-change', { status: 'generating' });
    
    try {
      for await (const event of this.activeBackend.generateStream(request)) {
        this.emitEvent('token-generated', { token: event.token });
        yield event;
        
        if (event.isComplete) {
          this.setStatus(NPUStatus.STATUS_IDLE | NPUStatus.STATUS_EOG);
          this.emitEvent('inference-complete', { complete: true });
        }
      }
      
      // Update telemetry
      this.state.telemetry = this.activeBackend.getTelemetry();
      this.emitEvent('telemetry-update', { telemetry: this.state.telemetry });
    } catch (error) {
      this.setStatus(NPUStatus.STATUS_ERROR);
      this.emitEvent('error', { error });
      throw error;
    }
  }
  
  /**
   * Load a model
   */
  async loadModel(modelId: string): Promise<ModelInfo> {
    if (!this.activeBackend) {
      throw new Error('No inference backend available');
    }
    
    this.setStatus(NPUStatus.STATUS_BUSY);
    
    try {
      const modelInfo = await this.activeBackend.loadModel(modelId);
      this.state.currentModel = modelInfo;
      this.setStatus(NPUStatus.STATUS_IDLE | NPUStatus.STATUS_MODEL_LOADED);
      this.emitEvent('model-loaded', { model: modelInfo });
      return modelInfo;
    } catch (error) {
      this.setStatus(NPUStatus.STATUS_ERROR);
      this.emitEvent('error', { error });
      throw error;
    }
  }
  
  /**
   * Unload current model
   */
  async unloadModel(): Promise<void> {
    if (!this.activeBackend) return;
    
    await this.activeBackend.unloadModel();
    this.state.currentModel = null;
    this.setStatus(NPUStatus.STATUS_IDLE);
    this.emitEvent('model-unloaded', {});
  }
  
  /**
   * Abort current inference
   */
  abort(): void {
    if (this.activeBackend) {
      this.activeBackend.abort();
      this.setStatus(NPUStatus.STATUS_IDLE);
      this.emitEvent('status-change', { status: 'aborted' });
    }
  }
  
  /**
   * Set inference configuration
   */
  setConfig(config: Partial<InferenceConfig>): void {
    this.state.config = { ...this.state.config, ...config };
  }
  
  /**
   * Get current configuration
   */
  getConfig(): InferenceConfig {
    return { ...this.state.config };
  }
  
  /**
   * Get current status
   */
  getStatus(): NPUStatus {
    return this.readRegister(NPU_REGISTERS.REG_STATUS);
  }
  
  /**
   * Get telemetry data
   */
  getTelemetry(): NPUTelemetry {
    return { ...this.state.telemetry };
  }
  
  /**
   * Get current model info
   */
  getModelInfo(): ModelInfo | null {
    return this.state.currentModel;
  }
  
  /**
   * Get driver state
   */
  getState(): NPUDriverState {
    return { ...this.state };
  }
  
  /**
   * Switch backend
   */
  async switchBackend(backendType: InferenceBackendType): Promise<void> {
    const backend = this.backends.get(backendType);
    if (!backend) {
      throw new Error(`Backend ${backendType} not available`);
    }
    
    // Unload current model if any
    if (this.activeBackend && this.state.currentModel) {
      await this.activeBackend.unloadModel();
    }
    
    this.activeBackend = backend;
    this.state.backend = backendType;
    this.state.currentModel = null;
    
    console.log(`NPU Driver: Switched to ${backendType} backend`);
  }
  
  /**
   * Get available backends
   */
  getAvailableBackends(): InferenceBackendType[] {
    return Array.from(this.backends.keys());
  }
  
  /**
   * Add event listener
   */
  addEventListener(type: NPUEventType, listener: NPUEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(type: NPUEventType, listener: NPUEventListener): void {
    this.eventListeners.get(type)?.delete(listener);
  }
  
  // Private methods
  
  private setStatus(status: NPUStatus): void {
    this.state.status = status;
    this.writeRegister(NPU_REGISTERS.REG_STATUS, status);
  }
  
  private emitEvent(type: NPUEventType, data: unknown): void {
    const event: NPUEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    this.eventListeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('NPU event listener error:', error);
      }
    });
  }
  
  private createEmptyTelemetry(): NPUTelemetry {
    return {
      tokensGenerated: 0,
      tokensPerSecond: 0,
      promptTokens: 0,
      totalInferences: 0,
      averageLatency: 0,
      memoryUsage: 0,
      gpuUtilization: 0,
      uptime: Date.now(),
      lastInferenceTime: 0,
    };
  }
  
  // Command handlers
  
  private async handleReset(): Promise<void> {
    this.abort();
    this.promptBuffer = '';
    this.systemPromptBuffer = '';
    this.outputBuffer = [];
    this.outputIndex = 0;
    this.state.config = { ...DEFAULT_INFERENCE_CONFIG };
    this.setStatus(NPUStatus.STATUS_IDLE);
  }
  
  private async handleLoadModel(): Promise<void> {
    // Model ID would be passed via a separate mechanism
    // For now, use default model
    await this.loadModel('default');
  }
  
  private async handleUnloadModel(): Promise<void> {
    await this.unloadModel();
  }
  
  private handleLoadPrompt(): void {
    this.setStatus(
      this.getStatus() | NPUStatus.STATUS_PROMPT_READY
    );
  }
  
  private async handleStartInference(): Promise<void> {
    const request: InferenceRequest = {
      prompt: this.promptBuffer,
      systemPrompt: this.systemPromptBuffer || undefined,
      config: this.state.config,
    };
    
    this.outputBuffer = [];
    this.outputIndex = 0;
    
    for await (const event of this.inferStream(request)) {
      this.outputBuffer.push(event.token);
    }
  }
  
  private handleStopInference(): void {
    this.abort();
  }
  
  private handleReadToken(): void {
    // Token reading is handled through the output buffer
    // This is a no-op for the high-level API
  }
  
  private handleGetTelemetry(): void {
    // Telemetry is updated automatically
    this.emitEvent('telemetry-update', { telemetry: this.state.telemetry });
  }
  
  private handleSetConfig(): void {
    // Config is set through the high-level API
  }
  
  /**
   * Set prompt buffer (for MMIO-style interface)
   */
  setPrompt(prompt: string, systemPrompt?: string): void {
    this.promptBuffer = prompt;
    this.systemPromptBuffer = systemPrompt || '';
  }
  
  /**
   * Get output buffer
   */
  getOutput(): string {
    return this.outputBuffer.join('');
  }
}

// Export singleton getter
export const getNPU = (): NPUDriver => NPUDriver.getInstance();
