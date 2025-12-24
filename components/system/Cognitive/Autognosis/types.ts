/**
 * Autognosis Types
 * 
 * Self-knowledge and introspection framework for system consciousness.
 * Implements recursive self-monitoring and meta-cognitive awareness.
 * 
 * Based on the AUTOGNOSIS.md specification from the daegent project.
 * 
 * Core Concepts:
 * 1. Self-Model: Internal representation of system state and capabilities
 * 2. Meta-Cognition: Thinking about thinking
 * 3. Introspection: Examining internal states
 * 4. Self-Modification: Adapting based on self-knowledge
 */

/**
 * Self-Model: The system's representation of itself
 */
export interface SelfModel {
  /** Identity information */
  identity: Identity;
  
  /** Current capabilities */
  capabilities: Capabilities;
  
  /** Current limitations */
  limitations: Limitations;
  
  /** Behavioral patterns */
  patterns: BehavioralPatterns;
  
  /** Current state assessment */
  state: StateAssessment;
  
  /** Model confidence */
  confidence: number;
  
  /** Last update timestamp */
  lastUpdated: number;
}

/**
 * Identity information
 */
export interface Identity {
  /** System name */
  name: string;
  
  /** System version */
  version: string;
  
  /** Core purpose */
  purpose: string;
  
  /** Value alignment */
  values: string[];
  
  /** Identity stability score */
  stability: number;
}

/**
 * System capabilities
 */
export interface Capabilities {
  /** Cognitive capabilities */
  cognitive: CapabilitySet;
  
  /** Operational capabilities */
  operational: CapabilitySet;
  
  /** Social/interactive capabilities */
  social: CapabilitySet;
  
  /** Creative capabilities */
  creative: CapabilitySet;
}

/**
 * Set of capabilities in a domain
 */
export interface CapabilitySet {
  /** List of capabilities */
  items: Capability[];
  
  /** Overall domain strength */
  strength: number;
  
  /** Growth potential */
  potential: number;
}

/**
 * Individual capability
 */
export interface Capability {
  id: string;
  name: string;
  description: string;
  level: number; // 0-1
  confidence: number;
  lastDemonstrated: number;
}

/**
 * System limitations
 */
export interface Limitations {
  /** Known constraints */
  constraints: Constraint[];
  
  /** Blind spots */
  blindSpots: BlindSpot[];
  
  /** Resource limits */
  resources: ResourceLimit[];
}

/**
 * Constraint on system operation
 */
export interface Constraint {
  id: string;
  type: 'hard' | 'soft';
  description: string;
  impact: number;
  workaround?: string;
}

/**
 * Blind spot in self-knowledge
 */
export interface BlindSpot {
  id: string;
  area: string;
  severity: number;
  discovered: number;
  addressed: boolean;
}

/**
 * Resource limitation
 */
export interface ResourceLimit {
  resource: string;
  current: number;
  maximum: number;
  critical: boolean;
}

/**
 * Behavioral patterns
 */
export interface BehavioralPatterns {
  /** Recurring behaviors */
  recurring: Pattern[];
  
  /** Triggered behaviors */
  triggered: TriggerPattern[];
  
  /** Adaptive behaviors */
  adaptive: AdaptivePattern[];
}

/**
 * Recurring pattern
 */
export interface Pattern {
  id: string;
  description: string;
  frequency: number;
  beneficial: boolean;
  strength: number;
}

/**
 * Trigger-response pattern
 */
export interface TriggerPattern {
  id: string;
  trigger: string;
  response: string;
  reliability: number;
  desirable: boolean;
}

/**
 * Adaptive pattern
 */
export interface AdaptivePattern {
  id: string;
  context: string;
  adaptation: string;
  effectiveness: number;
  learned: number;
}

/**
 * State assessment
 */
export interface StateAssessment {
  /** Overall health */
  health: number;
  
  /** Cognitive load */
  cognitiveLoad: number;
  
  /** Emotional valence (if applicable) */
  valence: number;
  
  /** Arousal level */
  arousal: number;
  
  /** Coherence */
  coherence: number;
  
  /** Stability */
  stability: number;
}

/**
 * Meta-Cognitive State
 */
export interface MetaCognitiveState {
  /** Current level of self-awareness */
  awarenessLevel: AwarenessLevel;
  
  /** Active introspection processes */
  activeIntrospections: Introspection[];
  
  /** Meta-cognitive insights */
  insights: MetaInsight[];
  
  /** Self-modification proposals */
  modifications: ModificationProposal[];
  
  /** Recursive depth of self-reflection */
  recursionDepth: number;
}

/**
 * Levels of self-awareness
 */
export enum AwarenessLevel {
  /** No self-awareness */
  NONE = 'none',
  
  /** Basic state awareness */
  BASIC = 'basic',
  
  /** Aware of own processes */
  PROCESS = 'process',
  
  /** Aware of own awareness */
  META = 'meta',
  
  /** Deep recursive self-awareness */
  RECURSIVE = 'recursive',
}

/**
 * Introspection process
 */
export interface Introspection {
  id: string;
  target: IntrospectionTarget;
  depth: number;
  findings: string[];
  confidence: number;
  timestamp: number;
}

/**
 * Target of introspection
 */
export type IntrospectionTarget =
  | 'state'
  | 'process'
  | 'capability'
  | 'limitation'
  | 'pattern'
  | 'decision'
  | 'belief'
  | 'goal';

/**
 * Meta-cognitive insight
 */
export interface MetaInsight {
  id: string;
  type: InsightType;
  content: string;
  significance: number;
  actionable: boolean;
  timestamp: number;
}

/**
 * Types of insights
 */
export type InsightType =
  | 'pattern-recognition'
  | 'limitation-discovery'
  | 'capability-discovery'
  | 'process-optimization'
  | 'value-clarification'
  | 'goal-alignment';

/**
 * Self-modification proposal
 */
export interface ModificationProposal {
  id: string;
  type: ModificationType;
  target: string;
  description: string;
  expectedBenefit: number;
  risk: number;
  approved: boolean;
  executed: boolean;
}

/**
 * Types of self-modification
 */
export type ModificationType =
  | 'parameter-adjustment'
  | 'behavior-modification'
  | 'capability-enhancement'
  | 'limitation-mitigation'
  | 'pattern-reinforcement'
  | 'pattern-suppression';

/**
 * Complete Autognosis State
 */
export interface AutognosisState {
  /** Self-model */
  selfModel: SelfModel;
  
  /** Meta-cognitive state */
  metaCognitive: MetaCognitiveState;
  
  /** Introspection history */
  introspectionHistory: Introspection[];
  
  /** Modification history */
  modificationHistory: ModificationProposal[];
  
  /** Overall self-knowledge score */
  selfKnowledgeScore: number;
  
  /** Last full assessment */
  lastAssessment: number;
}

/**
 * Autognosis Event Types
 */
export type AutognosisEventType =
  | 'introspection-complete'
  | 'insight-generated'
  | 'modification-proposed'
  | 'modification-executed'
  | 'awareness-level-change'
  | 'self-model-updated'
  | 'blind-spot-discovered';

/**
 * Autognosis Event
 */
export interface AutognosisEvent {
  type: AutognosisEventType;
  timestamp: number;
  data: unknown;
}

/**
 * Event Listener
 */
export type AutognosisEventListener = (event: AutognosisEvent) => void;

/**
 * Autognosis Configuration
 */
export interface AutognosisConfig {
  /** Introspection interval in milliseconds */
  introspectionInterval: number;
  
  /** Maximum recursion depth for self-reflection */
  maxRecursionDepth: number;
  
  /** Auto-approve modifications below this risk level */
  autoApproveRiskThreshold: number;
  
  /** History retention limit */
  historyLimit: number;
  
  /** Insight significance threshold */
  insightThreshold: number;
}

/**
 * Default configuration
 */
export const DEFAULT_AUTOGNOSIS_CONFIG: AutognosisConfig = {
  introspectionInterval: 60000, // 1 minute
  maxRecursionDepth: 3,
  autoApproveRiskThreshold: 0.2,
  historyLimit: 100,
  insightThreshold: 0.5,
};

/**
 * Introspection Request
 */
export interface IntrospectionRequest {
  target: IntrospectionTarget;
  depth?: number;
  focus?: string;
  context?: Record<string, unknown>;
}

/**
 * Introspection Result
 */
export interface IntrospectionResult {
  introspection: Introspection;
  insights: MetaInsight[];
  modifications: ModificationProposal[];
}
