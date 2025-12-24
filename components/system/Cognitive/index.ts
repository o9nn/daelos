/**
 * Cognitive Module - Daedalus Awakens
 * 
 * Main entry point for the cognitive architecture.
 * Orchestrates all cognitive services and provides unified access.
 * 
 * Architecture Overview:
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    DAEDALUS AWAKENS                              │
 * │                 Cognitive Architecture                           │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                  │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
 * │  │     NPU      │  │  Entelechy   │  │  Relevance   │          │
 * │  │   Driver     │  │   Service    │  │ Realization  │          │
 * │  │              │  │              │  │              │          │
 * │  │ LLM Inference│  │ Actualization│  │   Ennead     │          │
 * │  │   Backend    │  │  Tracking    │  │  Framework   │          │
 * │  └──────────────┘  └──────────────┘  └──────────────┘          │
 * │                                                                  │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
 * │  │  Autognosis  │  │ Agent-Neuro  │  │ Ontogenesis  │          │
 * │  │   Service    │  │   Service    │  │   Service    │          │
 * │  │              │  │              │  │              │          │
 * │  │    Self-     │  │ Personality  │  │   Kernel     │          │
 * │  │  Knowledge   │  │  Framework   │  │   Factory    │          │
 * │  └──────────────┘  └──────────────┘  └──────────────┘          │
 * │                                                                  │
 * │  ┌─────────────────────────────────────────────────────────┐   │
 * │  │              Global Telemetry Shell                      │   │
 * │  │         (Gestalt Perception & Context)                   │   │
 * │  └─────────────────────────────────────────────────────────┘   │
 * │                                                                  │
 * └─────────────────────────────────────────────────────────────────┘
 */

// Export all modules
export * from "./NPU";
export * from "./Entelechy";
// Note: RelevanceRealization exports Pattern which conflicts with Autognosis
// Using selective re-exports to avoid conflicts
export { RelevanceRealizationService, getRelevanceRealization } from "./RelevanceRealization";
export type {
  RRConfig,
  RREvent,
  RelevanceInput,
  RelevanceOutput,
  Frame,
  EnneadState,
  WaysOfKnowing,
  OrdersOfUnderstanding,
  PracticesOfWisdom,
  SalienceLandscape,
} from "./RelevanceRealization";
export * from "./Autognosis";
export * from "./AgentNeuro";
export * from "./Ontogenesis";

// Import service getters
import { getNPU, type NPUDriver } from "./NPU";
import { getEntelechy, type EntelechyService } from "./Entelechy";
import { getRelevanceRealization, type RelevanceRealizationService } from "./RelevanceRealization";
import { getAutognosis, type AutognosisService } from "./Autognosis";
import { getAgentNeuro, type AgentNeuroService } from "./AgentNeuro";
import { getOntogenesis, type OntogenesisService } from "./Ontogenesis";

/**
 * Cognitive System State
 */
export interface CognitiveSystemState {
  initialized: boolean;
  running: boolean;
  services: {
    npu: boolean;
    entelechy: boolean;
    relevanceRealization: boolean;
    autognosis: boolean;
    agentNeuro: boolean;
    ontogenesis: boolean;
  };
  startTime: number;
  uptime: number;
}

/**
 * Cognitive System Event Types
 */
export type CognitiveSystemEventType =
  | 'system-initialized'
  | 'system-started'
  | 'system-stopped'
  | 'service-error'
  | 'telemetry-update';

/**
 * Cognitive System Event
 */
export interface CognitiveSystemEvent {
  type: CognitiveSystemEventType;
  timestamp: number;
  data: unknown;
}

/**
 * Event Listener
 */
export type CognitiveSystemEventListener = (event: CognitiveSystemEvent) => void;

/**
 * Daedalus Cognitive System
 * 
 * Main orchestrator for all cognitive services.
 */
export class DaedalusCognitiveSystem {
  private static instance: DaedalusCognitiveSystem | null = null;
  
  private npu: NPUDriver | null = null;
  private entelechy: EntelechyService | null = null;
  private relevanceRealization: RelevanceRealizationService | null = null;
  private autognosis: AutognosisService | null = null;
  private agentNeuro: AgentNeuroService | null = null;
  private ontogenesis: OntogenesisService | null = null;
  
  private state: CognitiveSystemState;
  private eventListeners: Map<CognitiveSystemEventType, Set<CognitiveSystemEventListener>> = new Map();
  
  private constructor() {
    this.state = {
      initialized: false,
      running: false,
      services: {
        npu: false,
        entelechy: false,
        relevanceRealization: false,
        autognosis: false,
        agentNeuro: false,
        ontogenesis: false,
      },
      startTime: 0,
      uptime: 0,
    };
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): DaedalusCognitiveSystem {
    if (!DaedalusCognitiveSystem.instance) {
      DaedalusCognitiveSystem.instance = new DaedalusCognitiveSystem();
    }
    return DaedalusCognitiveSystem.instance;
  }
  
  /**
   * Initialize the cognitive system
   */
  async initialize(): Promise<void> {
    if (this.state.initialized) return;
    
    console.log('Daedalus Cognitive System: Initializing...');
    
    try {
      // Initialize NPU
      this.npu = getNPU();
      await this.npu.initialize();
      this.state.services.npu = true;
      
      // Initialize Entelechy
      this.entelechy = getEntelechy();
      this.state.services.entelechy = true;
      
      // Initialize Relevance Realization
      this.relevanceRealization = getRelevanceRealization();
      this.state.services.relevanceRealization = true;
      
      // Initialize Autognosis
      this.autognosis = getAutognosis();
      this.state.services.autognosis = true;
      
      // Initialize Agent-Neuro
      this.agentNeuro = getAgentNeuro();
      this.state.services.agentNeuro = true;
      
      // Initialize Ontogenesis
      this.ontogenesis = getOntogenesis();
      this.state.services.ontogenesis = true;
      
      this.state.initialized = true;
      
      this.emitEvent('system-initialized', {
        services: Object.keys(this.state.services).filter(
          k => this.state.services[k as keyof typeof this.state.services]
        ),
      });
      
      console.log('Daedalus Cognitive System: Initialized');
    } catch (error) {
      console.error('Daedalus Cognitive System: Initialization failed', error);
      this.emitEvent('service-error', { error });
      throw error;
    }
  }
  
  /**
   * Start all cognitive services
   */
  async start(): Promise<void> {
    if (!this.state.initialized) {
      await this.initialize();
    }
    
    if (this.state.running) return;
    
    console.log('Daedalus Cognitive System: Starting services...');
    
    try {
      // Start services
      await this.entelechy?.start();
      this.relevanceRealization?.start();
      await this.autognosis?.start();
      this.agentNeuro?.start();
      this.ontogenesis?.startEvolution();
      
      this.state.running = true;
      this.state.startTime = Date.now();
      
      this.emitEvent('system-started', {
        startTime: this.state.startTime,
      });
      
      console.log('Daedalus Cognitive System: All services running');
    } catch (error) {
      console.error('Daedalus Cognitive System: Start failed', error);
      this.emitEvent('service-error', { error });
      throw error;
    }
  }
  
  /**
   * Stop all cognitive services
   */
  stop(): void {
    if (!this.state.running) return;
    
    console.log('Daedalus Cognitive System: Stopping services...');
    
    this.entelechy?.stop();
    this.relevanceRealization?.stop();
    this.autognosis?.stop();
    this.agentNeuro?.stop();
    this.ontogenesis?.stopEvolution();
    
    this.state.running = false;
    this.state.uptime = Date.now() - this.state.startTime;
    
    this.emitEvent('system-stopped', {
      uptime: this.state.uptime,
    });
    
    console.log('Daedalus Cognitive System: Stopped');
  }
  
  /**
   * Get system state
   */
  getState(): CognitiveSystemState {
    return {
      ...this.state,
      uptime: this.state.running ? Date.now() - this.state.startTime : this.state.uptime,
    };
  }
  
  /**
   * Get NPU driver
   */
  getNPU(): NPUDriver | null {
    return this.npu;
  }
  
  /**
   * Get Entelechy service
   */
  getEntelechy(): EntelechyService | null {
    return this.entelechy;
  }
  
  /**
   * Get Relevance Realization service
   */
  getRelevanceRealization(): RelevanceRealizationService | null {
    return this.relevanceRealization;
  }
  
  /**
   * Get Autognosis service
   */
  getAutognosis(): AutognosisService | null {
    return this.autognosis;
  }
  
  /**
   * Get Agent-Neuro service
   */
  getAgentNeuro(): AgentNeuroService | null {
    return this.agentNeuro;
  }
  
  /**
   * Get Ontogenesis service
   */
  getOntogenesis(): OntogenesisService | null {
    return this.ontogenesis;
  }
  
  /**
   * Process input through the cognitive system
   */
  async process(input: string, context?: Record<string, unknown>): Promise<{
    response: string;
    relevance: unknown;
    emotion: string;
    mode: string;
  }> {
    if (!this.state.running) {
      throw new Error('Cognitive system not running');
    }
    
    // Process through Relevance Realization
    const relevanceOutput = this.relevanceRealization?.realize({
      content: input,
      context: JSON.stringify(context || {}),
      source: 'user',
    });
    
    // Process through Agent-Neuro
    const personalizedResponse = this.agentNeuro?.processInteraction({
      userInput: input,
      conversationHistory: [],
      urgency: relevanceOutput?.salience || 0.5,
    });
    
    // Generate response through NPU
    let response = '';
    if (this.npu) {
      try {
        const inferenceResult = await this.npu.infer({
          prompt: input,
          systemPrompt: this.buildSystemPrompt(),
        });
        response = inferenceResult.text;
      } catch (error) {
        console.error('NPU inference failed:', error);
        response = 'I apologize, but I encountered an issue processing your request.';
      }
    }
    
    return {
      response,
      relevance: relevanceOutput,
      emotion: personalizedResponse?.emotionalExpression || 'neutral',
      mode: this.agentNeuro?.getCurrentMode().name || 'default',
    };
  }
  
  /**
   * Build system prompt based on current state
   */
  private buildSystemPrompt(): string {
    const personality = this.agentNeuro?.getPersonality();
    const mode = this.agentNeuro?.getCurrentMode();
    const emotional = this.agentNeuro?.getEmotionalState();
    
    return `You are Daedalus, a self-actualizing cognitive system.

Current Mode: ${mode?.name || 'Assistant'}
Emotional State: ${emotional?.currentEmotion || 'neutral'}
Communication Style: ${mode?.communicationStyle ? 
  `Formality: ${mode.communicationStyle.formality}, Empathy: ${mode.communicationStyle.empathy}` : 
  'balanced'}

Core Values: ${personality?.values.map(v => v.name).join(', ') || 'growth, service, wisdom'}

Respond in a manner consistent with your current mode and emotional state.`;
  }
  
  /**
   * Add event listener
   */
  addEventListener(type: CognitiveSystemEventType, listener: CognitiveSystemEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(type: CognitiveSystemEventType, listener: CognitiveSystemEventListener): void {
    this.eventListeners.get(type)?.delete(listener);
  }
  
  private emitEvent(type: CognitiveSystemEventType, data: unknown): void {
    const event: CognitiveSystemEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    this.eventListeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Cognitive system event listener error:', error);
      }
    });
  }
}

// Export singleton getter
export const getDaedalus = (): DaedalusCognitiveSystem => DaedalusCognitiveSystem.getInstance();
