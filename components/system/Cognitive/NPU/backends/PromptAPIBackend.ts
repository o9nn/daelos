/**
 * Prompt API Backend for NPU
 * 
 * Implements inference using the Chrome Prompt API (dom-chromium-ai).
 * Provides native browser AI capabilities when available.
 */

import type {
  InferenceBackend,
  InferenceRequest,
  InferenceResponse,
  ModelInfo,
  NPUTelemetry,
  TokenStreamEvent,
} from "../types";

// Chrome AI types
declare global {
  interface Window {
    ai?: {
      languageModel?: {
        capabilities: () => Promise<{
          available: 'readily' | 'after-download' | 'no';
          defaultTemperature?: number;
          defaultTopK?: number;
          maxTopK?: number;
        }>;
        create: (options?: {
          systemPrompt?: string;
          temperature?: number;
          topK?: number;
        }) => Promise<{
          prompt: (input: string) => Promise<string>;
          promptStreaming: (input: string) => ReadableStream<string>;
          destroy: () => void;
        }>;
      };
    };
  }
}

export class PromptAPIBackend implements InferenceBackend {
  readonly type = 'prompt-api' as const;
  
  private session: {
    prompt: (input: string) => Promise<string>;
    promptStreaming: (input: string) => ReadableStream<string>;
    destroy: () => void;
  } | null = null;
  
  private currentModel: ModelInfo | null = null;
  private telemetry: NPUTelemetry;
  private abortController: AbortController | null = null;
  private _isAvailable = false;
  private capabilities: {
    available: 'readily' | 'after-download' | 'no';
    defaultTemperature?: number;
    defaultTopK?: number;
    maxTopK?: number;
  } | null = null;
  
  constructor() {
    this.telemetry = this.createEmptyTelemetry();
  }
  
  get isAvailable(): boolean {
    return this._isAvailable;
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
  
  async initialize(): Promise<void> {
    try {
      // Check for Prompt API availability
      if (typeof window === 'undefined' || !window.ai?.languageModel) {
        console.warn('Prompt API not available');
        this._isAvailable = false;
        return;
      }
      
      this.capabilities = await window.ai.languageModel.capabilities();
      
      if (this.capabilities.available === 'no') {
        console.warn('Prompt API model not available');
        this._isAvailable = false;
        return;
      }
      
      this._isAvailable = true;
      console.log('Prompt API backend initialized:', this.capabilities);
    } catch (error) {
      console.error('Failed to initialize Prompt API backend:', error);
      this._isAvailable = false;
    }
  }
  
  async loadModel(modelId: string): Promise<ModelInfo> {
    if (!window.ai?.languageModel) {
      throw new Error('Prompt API not available');
    }
    
    try {
      // Create a new session (Prompt API doesn't have explicit model loading)
      this.session = await window.ai.languageModel.create({
        temperature: this.capabilities?.defaultTemperature ?? 0.7,
        topK: this.capabilities?.defaultTopK ?? 40,
      });
      
      this.currentModel = {
        id: 'chrome-ai',
        name: 'Chrome Built-in AI',
        size: 0,
        quantization: 'native',
        contextLength: 8192,
        architecture: 'gemini-nano',
        loaded: true,
      };
      
      return this.currentModel;
    } catch (error) {
      throw new Error(`Failed to create Prompt API session: ${error}`);
    }
  }
  
  async unloadModel(): Promise<void> {
    if (this.session) {
      this.session.destroy();
      this.session = null;
      this.currentModel = null;
    }
  }
  
  async generate(request: InferenceRequest): Promise<InferenceResponse> {
    if (!this.session) {
      // Auto-create session if not exists
      await this.loadModel('chrome-ai');
    }
    
    if (!this.session) {
      throw new Error('Failed to create Prompt API session');
    }
    
    const startTime = performance.now();
    this.abortController = new AbortController();
    
    try {
      // Combine system prompt and user prompt
      let fullPrompt = request.prompt;
      if (request.systemPrompt) {
        fullPrompt = `${request.systemPrompt}\n\nUser: ${request.prompt}\n\nAssistant:`;
      }
      
      const response = await this.session.prompt(fullPrompt);
      const latency = performance.now() - startTime;
      
      // Estimate token counts (Prompt API doesn't provide this)
      const promptTokens = Math.ceil(fullPrompt.length / 4);
      const completionTokens = Math.ceil(response.length / 4);
      
      // Update telemetry
      this.telemetry.totalInferences++;
      this.telemetry.tokensGenerated += completionTokens;
      this.telemetry.promptTokens += promptTokens;
      this.telemetry.lastInferenceTime = Date.now();
      this.telemetry.tokensPerSecond = completionTokens / (latency / 1000);
      this.telemetry.averageLatency = 
        (this.telemetry.averageLatency * (this.telemetry.totalInferences - 1) + latency) / 
        this.telemetry.totalInferences;
      
      return {
        text: response,
        tokens: [],
        finishReason: 'stop',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        latency,
      };
    } catch (error) {
      if (this.abortController?.signal.aborted) {
        return {
          text: '',
          tokens: [],
          finishReason: 'stop',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          latency: performance.now() - startTime,
        };
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }
  
  async *generateStream(request: InferenceRequest): AsyncGenerator<TokenStreamEvent> {
    if (!this.session) {
      await this.loadModel('chrome-ai');
    }
    
    if (!this.session) {
      throw new Error('Failed to create Prompt API session');
    }
    
    this.abortController = new AbortController();
    
    try {
      let fullPrompt = request.prompt;
      if (request.systemPrompt) {
        fullPrompt = `${request.systemPrompt}\n\nUser: ${request.prompt}\n\nAssistant:`;
      }
      
      const stream = this.session.promptStreaming(fullPrompt);
      const reader = stream.getReader();
      
      let tokenIndex = 0;
      let fullText = '';
      
      while (true) {
        if (this.abortController?.signal.aborted) {
          break;
        }
        
        const { done, value } = await reader.read();
        
        if (done) {
          yield {
            token: '',
            tokenId: tokenIndex,
            isComplete: true,
            progress: 1,
          };
          break;
        }
        
        // Value contains the full text so far, extract new content
        const newContent = value.slice(fullText.length);
        fullText = value;
        
        if (newContent) {
          yield {
            token: newContent,
            tokenId: tokenIndex++,
            isComplete: false,
            progress: 0, // Unknown total length
          };
        }
      }
    } finally {
      this.abortController = null;
    }
  }
  
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
  
  getModelInfo(): ModelInfo | null {
    return this.currentModel;
  }
  
  getTelemetry(): NPUTelemetry {
    return { ...this.telemetry };
  }
}
