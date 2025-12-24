/**
 * NPU (Neural Processing Unit) Types
 * 
 * Defines the MMIO-style interface for LLM inference operations.
 * Based on the NPU.md specification from the daegent project.
 */

// MMIO Register Addresses
export const NPU_REGISTERS = {
  REG_CMD: 0x00,        // Command register
  REG_STATUS: 0x04,     // Status register
  REG_PROMPT: 0x08,     // Prompt buffer address
  REG_TOKEN_OUT: 0x0C,  // Output token buffer
  REG_TELEMETRY: 0x10,  // Telemetry data
  REG_MODEL: 0x14,      // Model configuration
  REG_CONFIG: 0x18,     // Inference configuration
  REG_ERROR: 0x1C,      // Error code register
} as const;

// NPU Commands
export enum NPUCommand {
  CMD_NOP = 0x00,
  CMD_RESET = 0x01,
  CMD_LOAD_MODEL = 0x02,
  CMD_UNLOAD_MODEL = 0x03,
  CMD_LOAD_PROMPT = 0x04,
  CMD_START_INF = 0x05,
  CMD_STOP_INF = 0x06,
  CMD_READ_TOKEN = 0x07,
  CMD_GET_TELEMETRY = 0x08,
  CMD_SET_CONFIG = 0x09,
}

// NPU Status Flags
export enum NPUStatus {
  STATUS_IDLE = 0x00,
  STATUS_BUSY = 0x01,
  STATUS_EOG = 0x02,      // End of generation
  STATUS_ERROR = 0x04,
  STATUS_MODEL_LOADED = 0x08,
  STATUS_PROMPT_READY = 0x10,
  STATUS_GENERATING = 0x20,
}

// Inference Backend Types
export type InferenceBackendType = 'webllm' | 'prompt-api' | 'external-api' | 'wasm';

// Inference Configuration
export interface InferenceConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;
  stopSequences: string[];
  streamOutput: boolean;
}

// Default inference configuration
export const DEFAULT_INFERENCE_CONFIG: InferenceConfig = {
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  repetitionPenalty: 1.1,
  stopSequences: [],
  streamOutput: true,
};

// Model Information
export interface ModelInfo {
  id: string;
  name: string;
  size: number;
  quantization: string;
  contextLength: number;
  architecture: string;
  loaded: boolean;
}

// Telemetry Data
export interface NPUTelemetry {
  tokensGenerated: number;
  tokensPerSecond: number;
  promptTokens: number;
  totalInferences: number;
  averageLatency: number;
  memoryUsage: number;
  gpuUtilization: number;
  uptime: number;
  lastInferenceTime: number;
}

// Inference Request
export interface InferenceRequest {
  prompt: string;
  systemPrompt?: string;
  config?: Partial<InferenceConfig>;
  conversationId?: string;
}

// Inference Response
export interface InferenceResponse {
  text: string;
  tokens: number[];
  finishReason: 'stop' | 'length' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency: number;
}

// Token Stream Event
export interface TokenStreamEvent {
  token: string;
  tokenId: number;
  isComplete: boolean;
  progress: number;
}

// NPU Event Types
export type NPUEventType = 
  | 'status-change'
  | 'token-generated'
  | 'inference-complete'
  | 'model-loaded'
  | 'model-unloaded'
  | 'error'
  | 'telemetry-update';

// NPU Event
export interface NPUEvent {
  type: NPUEventType;
  timestamp: number;
  data: unknown;
}

// NPU Event Listener
export type NPUEventListener = (event: NPUEvent) => void;

// Backend Interface
export interface InferenceBackend {
  readonly type: InferenceBackendType;
  readonly isAvailable: boolean;
  
  initialize(): Promise<void>;
  loadModel(modelId: string): Promise<ModelInfo>;
  unloadModel(): Promise<void>;
  generate(request: InferenceRequest): Promise<InferenceResponse>;
  generateStream(request: InferenceRequest): AsyncGenerator<TokenStreamEvent>;
  abort(): void;
  getModelInfo(): ModelInfo | null;
  getTelemetry(): NPUTelemetry;
}

// Global Telemetry Shell Integration
export interface GlobalTelemetryContext {
  gestalt: {
    currentContext: Map<string, unknown>;
    channels: Map<string, CognitiveChannel>;
  };
  registerCore(core: CognitiveCore): void;
  multiplex(): Promise<void>;
}

export interface CognitiveChannel {
  id: string;
  type: string;
  active: boolean;
  lastActivity: number;
}

export interface CognitiveCore {
  id: string;
  channel: CognitiveChannel;
  setContext(context: Map<string, unknown>): void;
}

// NPU Driver State
export interface NPUDriverState {
  status: NPUStatus;
  currentModel: ModelInfo | null;
  config: InferenceConfig;
  telemetry: NPUTelemetry;
  backend: InferenceBackendType;
  isInitialized: boolean;
}
