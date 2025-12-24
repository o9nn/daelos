/**
 * WebLLM Backend for NPU
 * 
 * Implements local LLM inference using the @mlc-ai/web-llm library.
 * Provides WebGPU-accelerated inference in the browser.
 */

import type {
  InferenceBackend,
  InferenceRequest,
  InferenceResponse,
  ModelInfo,
  NPUTelemetry,
  TokenStreamEvent,
} from "../types";

// WebLLM types (imported dynamically to avoid SSR issues)
type MLCEngine = {
  reload: (modelId: string) => Promise<void>;
  unload: () => Promise<void>;
  chat: {
    completions: {
      create: (params: {
        messages: Array<{ role: string; content: string }>;
        temperature?: number;
        max_tokens?: number;
        top_p?: number;
        stream?: boolean;
      }) => Promise<{
        choices: Array<{
          message: { content: string };
          finish_reason: string;
        }>;
        usage: {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
        };
      }>;
    };
  };
  getMessage: () => string;
  runtimeStatsText: () => string;
  interruptGenerate: () => void;
};

export class WebLLMBackend implements InferenceBackend {
  readonly type = 'webllm' as const;
  
  private engine: MLCEngine | null = null;
  private currentModel: ModelInfo | null = null;
  private telemetry: NPUTelemetry;
  private abortController: AbortController | null = null;
  private _isAvailable = false;
  private initPromise: Promise<void> | null = null;
  
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
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = (async () => {
      try {
        // Check for WebGPU support
        if (!(navigator as Navigator & { gpu?: unknown }).gpu) {
          console.warn('WebGPU not available, WebLLM backend disabled');
          this._isAvailable = false;
          return;
        }
        
        // Dynamically import WebLLM to avoid SSR issues
        const webllm = await import('@mlc-ai/web-llm');
        
        // Create engine instance
        this.engine = await webllm.CreateMLCEngine(
          "Llama-3.2-1B-Instruct-q4f16_1-MLC", // Default small model
          {
            initProgressCallback: (progress) => {
              console.log(`WebLLM Init: ${progress.text}`);
            },
          }
        ) as unknown as MLCEngine;
        
        this._isAvailable = true;
        console.log('WebLLM backend initialized successfully');
      } catch (error) {
        console.error('Failed to initialize WebLLM backend:', error);
        this._isAvailable = false;
      }
    })();
    
    return this.initPromise;
  }
  
  async loadModel(modelId: string): Promise<ModelInfo> {
    if (!this.engine) {
      throw new Error('WebLLM engine not initialized');
    }
    
    try {
      await this.engine.reload(modelId);
      
      this.currentModel = {
        id: modelId,
        name: modelId,
        size: 0, // Size determined by model
        quantization: 'q4f16',
        contextLength: 4096,
        architecture: 'llama',
        loaded: true,
      };
      
      return this.currentModel;
    } catch (error) {
      throw new Error(`Failed to load model ${modelId}: ${error}`);
    }
  }
  
  async unloadModel(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.currentModel = null;
    }
  }
  
  async generate(request: InferenceRequest): Promise<InferenceResponse> {
    if (!this.engine) {
      throw new Error('WebLLM engine not initialized');
    }
    
    const startTime = performance.now();
    this.abortController = new AbortController();
    
    try {
      const messages: Array<{ role: string; content: string }> = [];
      
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      
      messages.push({ role: 'user', content: request.prompt });
      
      const response = await this.engine.chat.completions.create({
        messages,
        temperature: request.config?.temperature ?? 0.7,
        max_tokens: request.config?.maxTokens ?? 2048,
        top_p: request.config?.topP ?? 0.9,
        stream: false,
      });
      
      const latency = performance.now() - startTime;
      
      // Update telemetry
      this.telemetry.totalInferences++;
      this.telemetry.tokensGenerated += response.usage.completion_tokens;
      this.telemetry.promptTokens += response.usage.prompt_tokens;
      this.telemetry.lastInferenceTime = Date.now();
      this.telemetry.tokensPerSecond = response.usage.completion_tokens / (latency / 1000);
      this.telemetry.averageLatency = 
        (this.telemetry.averageLatency * (this.telemetry.totalInferences - 1) + latency) / 
        this.telemetry.totalInferences;
      
      return {
        text: response.choices[0]?.message?.content ?? '',
        tokens: [], // Token IDs not exposed by WebLLM
        finishReason: response.choices[0]?.finish_reason === 'stop' ? 'stop' : 'length',
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
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
    if (!this.engine) {
      throw new Error('WebLLM engine not initialized');
    }
    
    this.abortController = new AbortController();
    
    const messages: Array<{ role: string; content: string }> = [];
    
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    
    messages.push({ role: 'user', content: request.prompt });
    
    try {
      // WebLLM streaming implementation
      // Note: Actual streaming depends on WebLLM version
      const response = await this.engine.chat.completions.create({
        messages,
        temperature: request.config?.temperature ?? 0.7,
        max_tokens: request.config?.maxTokens ?? 2048,
        top_p: request.config?.topP ?? 0.9,
        stream: true,
      });
      
      // For non-streaming fallback, yield the complete response
      const text = response.choices[0]?.message?.content ?? '';
      const tokens = text.split('');
      
      for (let i = 0; i < tokens.length; i++) {
        if (this.abortController?.signal.aborted) {
          break;
        }
        
        yield {
          token: tokens[i],
          tokenId: i,
          isComplete: i === tokens.length - 1,
          progress: (i + 1) / tokens.length,
        };
      }
    } finally {
      this.abortController = null;
    }
  }
  
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.engine) {
      this.engine.interruptGenerate();
    }
  }
  
  getModelInfo(): ModelInfo | null {
    return this.currentModel;
  }
  
  getTelemetry(): NPUTelemetry {
    return { ...this.telemetry };
  }
}
