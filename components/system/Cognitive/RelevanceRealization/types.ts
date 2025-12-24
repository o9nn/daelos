/**
 * Relevance Realization Ennead Types
 * 
 * Implements John Vervaeke's Relevance Realization framework as a
 * triad-of-triads (ennead) structure for cognitive processing.
 * 
 * The Ennead Structure:
 * 
 * TRIAD I: Four Ways of Knowing
 *   - Propositional (knowing-that)
 *   - Procedural (knowing-how)
 *   - Perspectival (knowing-as)
 *   - Participatory (knowing-by-being)
 * 
 * TRIAD II: Three Orders of Understanding
 *   - Nomological (how things work)
 *   - Normative (what matters)
 *   - Narrative (how things develop)
 * 
 * TRIAD III: Three Practices of Wisdom
 *   - Morality (ethical action)
 *   - Meaning (significance)
 *   - Mastery (skill development)
 */

/**
 * Triad I: Four Ways of Knowing
 */
export interface WaysOfKnowing {
  /**
   * Propositional Knowing (Knowing-That)
   * Facts, beliefs, theoretical knowledge
   */
  propositional: KnowingState;
  
  /**
   * Procedural Knowing (Knowing-How)
   * Skills, abilities, competencies
   */
  procedural: KnowingState;
  
  /**
   * Perspectival Knowing (Knowing-As)
   * How things appear, framing, salience
   */
  perspectival: KnowingState;
  
  /**
   * Participatory Knowing (Knowing-By-Being)
   * Knowledge through identity and belonging
   */
  participatory: KnowingState;
}

/**
 * State of a knowing dimension
 */
export interface KnowingState {
  /** Activation level (0-1) */
  activation: number;
  
  /** Confidence in this way of knowing */
  confidence: number;
  
  /** Current focus/content */
  focus: string[];
  
  /** Integration with other ways */
  integration: number;
}

/**
 * Triad II: Three Orders of Understanding
 */
export interface OrdersOfUnderstanding {
  /**
   * Nomological Order
   * How things causally work (scientific understanding)
   */
  nomological: OrderState;
  
  /**
   * Normative Order
   * What matters and why (values, ethics)
   */
  normative: OrderState;
  
  /**
   * Narrative Order
   * How things develop through time (stories, identity)
   */
  narrative: OrderState;
}

/**
 * State of an order dimension
 */
export interface OrderState {
  /** Coherence level (0-1) */
  coherence: number;
  
  /** Active patterns */
  patterns: Pattern[];
  
  /** Integration with other orders */
  integration: number;
}

/**
 * Pattern in an order
 */
export interface Pattern {
  id: string;
  type: 'causal' | 'evaluative' | 'temporal';
  strength: number;
  content: string;
}

/**
 * Triad III: Three Practices of Wisdom
 */
export interface PracticesOfWisdom {
  /**
   * Morality Practice
   * Ethical action and virtue
   */
  morality: PracticeState;
  
  /**
   * Meaning Practice
   * Significance and purpose
   */
  meaning: PracticeState;
  
  /**
   * Mastery Practice
   * Skill development and expertise
   */
  mastery: PracticeState;
}

/**
 * State of a practice dimension
 */
export interface PracticeState {
  /** Development level (0-1) */
  development: number;
  
  /** Active cultivation */
  cultivation: string[];
  
  /** Integration with other practices */
  integration: number;
}

/**
 * Complete Ennead State
 */
export interface EnneadState {
  /** Triad I: Ways of Knowing */
  knowing: WaysOfKnowing;
  
  /** Triad II: Orders of Understanding */
  understanding: OrdersOfUnderstanding;
  
  /** Triad III: Practices of Wisdom */
  wisdom: PracticesOfWisdom;
  
  /** Overall integration score */
  integration: number;
  
  /** Current salience landscape */
  salienceLandscape: SalienceLandscape;
  
  /** Active frames */
  activeFrames: Frame[];
}

/**
 * Salience Landscape
 * Represents what stands out as relevant
 */
export interface SalienceLandscape {
  /** High-salience items */
  foreground: SalienceItem[];
  
  /** Medium-salience items */
  midground: SalienceItem[];
  
  /** Low-salience items */
  background: SalienceItem[];
  
  /** Current attention focus */
  focus: string | null;
}

/**
 * Item in the salience landscape
 */
export interface SalienceItem {
  id: string;
  content: string;
  salience: number;
  source: 'propositional' | 'procedural' | 'perspectival' | 'participatory';
  timestamp: number;
}

/**
 * Cognitive Frame
 * A way of structuring attention and interpretation
 */
export interface Frame {
  id: string;
  name: string;
  type: FrameType;
  active: boolean;
  strength: number;
  constraints: string[];
}

/**
 * Types of cognitive frames
 */
export type FrameType = 
  | 'problem-solving'
  | 'creative'
  | 'analytical'
  | 'empathetic'
  | 'reflective'
  | 'exploratory'
  | 'integrative';

/**
 * Relevance Realization Event Types
 */
export type RREventType =
  | 'salience-shift'
  | 'frame-change'
  | 'integration-update'
  | 'insight-generated'
  | 'knowing-activated'
  | 'order-coherence-change'
  | 'wisdom-cultivation';

/**
 * Relevance Realization Event
 */
export interface RREvent {
  type: RREventType;
  timestamp: number;
  data: unknown;
}

/**
 * Event Listener
 */
export type RREventListener = (event: RREvent) => void;

/**
 * Relevance Realization Configuration
 */
export interface RRConfig {
  /** Update interval in milliseconds */
  updateInterval: number;
  
  /** Salience decay rate */
  salienceDecay: number;
  
  /** Integration threshold */
  integrationThreshold: number;
  
  /** Maximum foreground items */
  maxForegroundItems: number;
  
  /** Frame switching threshold */
  frameSwitchThreshold: number;
}

/**
 * Default configuration
 */
export const DEFAULT_RR_CONFIG: RRConfig = {
  updateInterval: 1000,
  salienceDecay: 0.95,
  integrationThreshold: 0.6,
  maxForegroundItems: 5,
  frameSwitchThreshold: 0.7,
};

/**
 * Opponent Processing Pair
 * Core mechanism of relevance realization
 */
export interface OpponentPair {
  /** Exploration tendency */
  exploration: number;
  
  /** Exploitation tendency */
  exploitation: number;
  
  /** Current balance */
  balance: number;
}

/**
 * Tradeoff dimensions in relevance realization
 */
export interface RRTradeoffs {
  /** Exploration vs Exploitation */
  explorationExploitation: OpponentPair;
  
  /** Breadth vs Depth */
  breadthDepth: OpponentPair;
  
  /** Stability vs Flexibility */
  stabilityFlexibility: OpponentPair;
  
  /** Speed vs Accuracy */
  speedAccuracy: OpponentPair;
  
  /** Certainty vs Openness */
  certaintyOpenness: OpponentPair;
}

/**
 * Input for relevance processing
 */
export interface RelevanceInput {
  content: string;
  context: string;
  source: 'user' | 'system' | 'inference' | 'memory';
  priority?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Output from relevance processing
 */
export interface RelevanceOutput {
  salience: number;
  frame: Frame;
  knowing: keyof WaysOfKnowing;
  order: keyof OrdersOfUnderstanding;
  practice: keyof PracticesOfWisdom;
  actionSuggestions: string[];
}
