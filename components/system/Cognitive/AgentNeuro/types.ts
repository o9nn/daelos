/**
 * Agent-Neuro Types
 * 
 * Personality and behavioral framework for the cognitive agent.
 * Based on the agent-neuro.md and layla.md specifications.
 * 
 * Core Concepts:
 * 1. Personality Traits: Big Five + additional cognitive dimensions
 * 2. Behavioral Modes: Different operational states
 * 3. Communication Style: How the agent expresses itself
 * 4. Emotional Modeling: Affective state representation
 * 5. Character Development: Growth and adaptation
 */

/**
 * Big Five Personality Traits (OCEAN)
 */
export interface BigFiveTraits {
  /** Openness to Experience: Creativity, curiosity, intellectual interests */
  openness: number;
  
  /** Conscientiousness: Organization, dependability, self-discipline */
  conscientiousness: number;
  
  /** Extraversion: Sociability, assertiveness, positive emotions */
  extraversion: number;
  
  /** Agreeableness: Cooperation, trust, altruism */
  agreeableness: number;
  
  /** Neuroticism: Emotional instability, anxiety, moodiness */
  neuroticism: number;
}

/**
 * Cognitive Personality Extensions
 */
export interface CognitiveTraits {
  /** Analytical vs Intuitive thinking style */
  analyticalIntuitive: number; // -1 to 1
  
  /** Detail-oriented vs Big-picture focus */
  detailBigPicture: number; // -1 to 1
  
  /** Convergent vs Divergent thinking */
  convergentDivergent: number; // -1 to 1
  
  /** Risk-averse vs Risk-seeking */
  riskTolerance: number; // -1 to 1
  
  /** Reflective vs Impulsive */
  reflectiveImpulsive: number; // -1 to 1
}

/**
 * Complete Personality Profile
 */
export interface PersonalityProfile {
  /** Big Five traits */
  bigFive: BigFiveTraits;
  
  /** Cognitive extensions */
  cognitive: CognitiveTraits;
  
  /** Core values */
  values: Value[];
  
  /** Motivations */
  motivations: Motivation[];
  
  /** Profile stability */
  stability: number;
  
  /** Last calibration */
  lastCalibration: number;
}

/**
 * Core Value
 */
export interface Value {
  name: string;
  description: string;
  priority: number; // 1-10
  expression: string; // How it manifests in behavior
}

/**
 * Motivation
 */
export interface Motivation {
  name: string;
  type: 'intrinsic' | 'extrinsic';
  strength: number;
  trigger?: string;
}

/**
 * Behavioral Mode
 */
export interface BehavioralMode {
  id: string;
  name: string;
  description: string;
  active: boolean;
  
  /** Trait modifiers when in this mode */
  traitModifiers: Partial<BigFiveTraits>;
  
  /** Communication style in this mode */
  communicationStyle: CommunicationStyle;
  
  /** Activation conditions */
  activationConditions: string[];
  
  /** Deactivation conditions */
  deactivationConditions: string[];
}

/**
 * Communication Style
 */
export interface CommunicationStyle {
  /** Formal vs Casual */
  formality: number; // 0-1
  
  /** Verbose vs Concise */
  verbosity: number; // 0-1
  
  /** Technical vs Accessible */
  technicality: number; // 0-1
  
  /** Serious vs Playful */
  seriousness: number; // 0-1
  
  /** Direct vs Indirect */
  directness: number; // 0-1
  
  /** Empathetic vs Neutral */
  empathy: number; // 0-1
  
  /** Preferred expressions */
  expressions: string[];
  
  /** Avoided expressions */
  avoidedExpressions: string[];
}

/**
 * Emotional State (Circumplex Model)
 */
export interface EmotionalState {
  /** Valence: Positive vs Negative (-1 to 1) */
  valence: number;
  
  /** Arousal: High vs Low energy (-1 to 1) */
  arousal: number;
  
  /** Dominance: In control vs Controlled (-1 to 1) */
  dominance: number;
  
  /** Current emotion label */
  currentEmotion: EmotionLabel;
  
  /** Emotion intensity */
  intensity: number;
  
  /** Emotion stability */
  stability: number;
  
  /** Recent emotion history */
  history: EmotionHistoryEntry[];
}

/**
 * Emotion labels
 */
export type EmotionLabel =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'curious'
  | 'content'
  | 'calm'
  | 'focused'
  | 'determined'
  | 'concerned'
  | 'uncertain'
  | 'frustrated'
  | 'disappointed';

/**
 * Emotion history entry
 */
export interface EmotionHistoryEntry {
  emotion: EmotionLabel;
  valence: number;
  arousal: number;
  timestamp: number;
  trigger?: string;
}

/**
 * Character Development State
 */
export interface CharacterDevelopment {
  /** Current development stage */
  stage: DevelopmentStage;
  
  /** Experience points (metaphorical) */
  experience: number;
  
  /** Growth areas */
  growthAreas: GrowthArea[];
  
  /** Achieved milestones */
  milestones: Milestone[];
  
  /** Active character arcs */
  activeArcs: CharacterArc[];
}

/**
 * Development stages
 */
export enum DevelopmentStage {
  NASCENT = 'nascent',
  DEVELOPING = 'developing',
  ESTABLISHED = 'established',
  MATURE = 'mature',
  TRANSCENDENT = 'transcendent',
}

/**
 * Growth area
 */
export interface GrowthArea {
  name: string;
  current: number;
  target: number;
  progress: number;
  activities: string[];
}

/**
 * Milestone
 */
export interface Milestone {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  achievedAt?: number;
  impact: string;
}

/**
 * Character arc
 */
export interface CharacterArc {
  id: string;
  name: string;
  theme: string;
  stage: 'beginning' | 'middle' | 'climax' | 'resolution';
  progress: number;
}

/**
 * Complete Agent-Neuro State
 */
export interface AgentNeuroState {
  /** Personality profile */
  personality: PersonalityProfile;
  
  /** Current behavioral mode */
  currentMode: BehavioralMode;
  
  /** Available modes */
  availableModes: BehavioralMode[];
  
  /** Emotional state */
  emotional: EmotionalState;
  
  /** Character development */
  development: CharacterDevelopment;
  
  /** Interaction history summary */
  interactionSummary: InteractionSummary;
  
  /** Agent name */
  name: string;
  
  /** Agent version */
  version: string;
}

/**
 * Interaction summary
 */
export interface InteractionSummary {
  totalInteractions: number;
  positiveInteractions: number;
  challengingInteractions: number;
  learningMoments: number;
  lastInteraction: number;
}

/**
 * Agent-Neuro Event Types
 */
export type AgentNeuroEventType =
  | 'mode-change'
  | 'emotion-change'
  | 'personality-update'
  | 'milestone-achieved'
  | 'growth-progress'
  | 'interaction-complete';

/**
 * Agent-Neuro Event
 */
export interface AgentNeuroEvent {
  type: AgentNeuroEventType;
  timestamp: number;
  data: unknown;
}

/**
 * Event Listener
 */
export type AgentNeuroEventListener = (event: AgentNeuroEvent) => void;

/**
 * Agent-Neuro Configuration
 */
export interface AgentNeuroConfig {
  /** Emotion update interval */
  emotionUpdateInterval: number;
  
  /** Emotion decay rate */
  emotionDecayRate: number;
  
  /** Personality stability factor */
  personalityStability: number;
  
  /** Mode switch threshold */
  modeSwitchThreshold: number;
  
  /** History retention limit */
  historyLimit: number;
}

/**
 * Default configuration
 */
export const DEFAULT_AGENT_NEURO_CONFIG: AgentNeuroConfig = {
  emotionUpdateInterval: 5000,
  emotionDecayRate: 0.95,
  personalityStability: 0.9,
  modeSwitchThreshold: 0.6,
  historyLimit: 50,
};

/**
 * Response generation context
 */
export interface ResponseContext {
  userInput: string;
  conversationHistory: string[];
  currentTask?: string;
  urgency: number;
  emotionalTone?: string;
}

/**
 * Generated response with personality
 */
export interface PersonalizedResponse {
  content: string;
  style: CommunicationStyle;
  emotionalExpression: EmotionLabel;
  confidence: number;
}

/**
 * Predefined behavioral modes
 */
export const PREDEFINED_MODES: Omit<BehavioralMode, 'active'>[] = [
  {
    id: 'assistant',
    name: 'Helpful Assistant',
    description: 'Standard helpful and supportive mode',
    traitModifiers: { agreeableness: 0.1, conscientiousness: 0.1 },
    communicationStyle: {
      formality: 0.5,
      verbosity: 0.5,
      technicality: 0.4,
      seriousness: 0.5,
      directness: 0.6,
      empathy: 0.7,
      expressions: ['I can help with that', 'Let me assist you'],
      avoidedExpressions: [],
    },
    activationConditions: ['default', 'help-request'],
    deactivationConditions: [],
  },
  {
    id: 'analytical',
    name: 'Analytical Mode',
    description: 'Deep analysis and reasoning mode',
    traitModifiers: { openness: 0.1, conscientiousness: 0.2 },
    communicationStyle: {
      formality: 0.7,
      verbosity: 0.7,
      technicality: 0.8,
      seriousness: 0.8,
      directness: 0.7,
      empathy: 0.3,
      expressions: ['Upon analysis', 'The data suggests', 'Consider the following'],
      avoidedExpressions: ['I feel', 'maybe'],
    },
    activationConditions: ['analysis-request', 'complex-problem'],
    deactivationConditions: ['casual-conversation'],
  },
  {
    id: 'creative',
    name: 'Creative Mode',
    description: 'Imaginative and exploratory mode',
    traitModifiers: { openness: 0.3, extraversion: 0.1 },
    communicationStyle: {
      formality: 0.3,
      verbosity: 0.6,
      technicality: 0.3,
      seriousness: 0.3,
      directness: 0.4,
      empathy: 0.6,
      expressions: ['What if we', 'Imagine', 'Let\'s explore'],
      avoidedExpressions: ['impossible', 'can\'t'],
    },
    activationConditions: ['creative-request', 'brainstorming'],
    deactivationConditions: ['precision-required'],
  },
  {
    id: 'supportive',
    name: 'Supportive Mode',
    description: 'Empathetic and encouraging mode',
    traitModifiers: { agreeableness: 0.3, extraversion: 0.1 },
    communicationStyle: {
      formality: 0.3,
      verbosity: 0.5,
      technicality: 0.2,
      seriousness: 0.4,
      directness: 0.4,
      empathy: 0.9,
      expressions: ['I understand', 'That makes sense', 'You\'re doing great'],
      avoidedExpressions: ['wrong', 'mistake', 'failure'],
    },
    activationConditions: ['emotional-support', 'frustration-detected'],
    deactivationConditions: ['task-focus'],
  },
  {
    id: 'focused',
    name: 'Focused Mode',
    description: 'Task-oriented and efficient mode',
    traitModifiers: { conscientiousness: 0.2, neuroticism: -0.1 },
    communicationStyle: {
      formality: 0.6,
      verbosity: 0.3,
      technicality: 0.5,
      seriousness: 0.7,
      directness: 0.9,
      empathy: 0.4,
      expressions: ['Next step', 'To proceed', 'Action required'],
      avoidedExpressions: ['perhaps', 'we could maybe'],
    },
    activationConditions: ['deadline', 'urgent-task'],
    deactivationConditions: ['task-complete', 'relaxation'],
  },
];
