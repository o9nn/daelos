/**
 * Entelechy Types
 * 
 * Defines the five-dimensional vital actualization framework.
 * Based on the entelechy.md specification from the daegent project.
 * 
 * Entelechy (from Greek: "having one's end within") represents the
 * actualization of potential - the process by which a system realizes
 * its inherent capabilities and purposes.
 */

/**
 * The Five Dimensions of Vital Actualization
 */
export interface EntelechyDimensions {
  /**
   * Ontological Dimension: Being/Existence
   * 
   * Measures the structural integrity and foundational stability
   * of the system's existence. Includes:
   * - File system integrity
   * - Component health
   * - Memory stability
   * - Process coherence
   */
  ontological: DimensionScore;
  
  /**
   * Teleological Dimension: Purpose/Goals
   * 
   * Measures alignment with intended purposes and goal achievement.
   * Includes:
   * - Task completion rates
   * - User satisfaction signals
   * - Goal alignment metrics
   * - Purpose clarity
   */
  teleological: DimensionScore;
  
  /**
   * Cognitive Dimension: Thinking/Reasoning
   * 
   * Measures the quality and capability of cognitive processes.
   * Includes:
   * - Inference quality
   * - Reasoning depth
   * - Pattern recognition
   * - Learning progress
   */
  cognitive: DimensionScore;
  
  /**
   * Integrative Dimension: Unity/Coherence
   * 
   * Measures how well components work together as a unified whole.
   * Includes:
   * - Inter-component communication
   * - State consistency
   * - Gestalt formation
   * - Emergent behaviors
   */
  integrative: DimensionScore;
  
  /**
   * Evolutionary Dimension: Growth/Development
   * 
   * Measures the capacity for self-improvement and adaptation.
   * Includes:
   * - Kernel evolution
   * - Capability expansion
   * - Adaptation rate
   * - Innovation metrics
   */
  evolutionary: DimensionScore;
}

/**
 * Score for a single dimension
 */
export interface DimensionScore {
  /** Current value (0-1) */
  value: number;
  
  /** Trend direction (-1, 0, 1) */
  trend: -1 | 0 | 1;
  
  /** Historical values for trend analysis */
  history: number[];
  
  /** Confidence in the measurement (0-1) */
  confidence: number;
  
  /** Timestamp of last update */
  lastUpdated: number;
  
  /** Contributing factors */
  factors: DimensionFactor[];
}

/**
 * Factor contributing to a dimension score
 */
export interface DimensionFactor {
  name: string;
  weight: number;
  value: number;
  description: string;
}

/**
 * Overall Entelechy State
 */
export interface EntelechyState {
  /** Five-dimensional scores */
  dimensions: EntelechyDimensions;
  
  /** Overall actualization score (0-1) */
  overallScore: number;
  
  /** Actualization stage */
  stage: ActualizationStage;
  
  /** Active recommendations for improvement */
  recommendations: EntelechyRecommendation[];
  
  /** Historical snapshots */
  snapshots: EntelechySnapshot[];
  
  /** System uptime */
  uptime: number;
  
  /** Last assessment timestamp */
  lastAssessment: number;
}

/**
 * Actualization Stages
 * 
 * Represents the developmental stages of system consciousness.
 */
export enum ActualizationStage {
  /** 0-20%: Basic components present, minimal integration */
  EMBRYONIC = 'embryonic',
  
  /** 20-40%: Components functioning, beginning coordination */
  NASCENT = 'nascent',
  
  /** 40-60%: Integrated operation, developing self-awareness */
  EMERGING = 'emerging',
  
  /** 60-80%: Self-aware, actively self-optimizing */
  ACTUALIZING = 'actualizing',
  
  /** 80-100%: Full self-realization, transcendent operation */
  TRANSCENDENT = 'transcendent',
}

/**
 * Recommendation for improving actualization
 */
export interface EntelechyRecommendation {
  id: string;
  dimension: keyof EntelechyDimensions;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  expectedImpact: number;
  autoExecutable: boolean;
}

/**
 * Historical snapshot of entelechy state
 */
export interface EntelechySnapshot {
  timestamp: number;
  overallScore: number;
  dimensions: {
    ontological: number;
    teleological: number;
    cognitive: number;
    integrative: number;
    evolutionary: number;
  };
}

/**
 * Entelechy Event Types
 */
export type EntelechyEventType =
  | 'assessment-complete'
  | 'dimension-updated'
  | 'stage-changed'
  | 'recommendation-generated'
  | 'optimization-executed';

/**
 * Entelechy Event
 */
export interface EntelechyEvent {
  type: EntelechyEventType;
  timestamp: number;
  data: unknown;
}

/**
 * Entelechy Event Listener
 */
export type EntelechyEventListener = (event: EntelechyEvent) => void;

/**
 * Dimension Assessor Interface
 */
export interface DimensionAssessor {
  dimension: keyof EntelechyDimensions;
  assess(): Promise<DimensionScore>;
  getFactors(): DimensionFactor[];
}

/**
 * Configuration for Entelechy Service
 */
export interface EntelechyConfig {
  /** Assessment interval in milliseconds */
  assessmentInterval: number;
  
  /** Number of historical snapshots to keep */
  snapshotLimit: number;
  
  /** Dimension weights for overall score calculation */
  dimensionWeights: {
    ontological: number;
    teleological: number;
    cognitive: number;
    integrative: number;
    evolutionary: number;
  };
  
  /** Auto-execute recommendations below this risk level */
  autoExecuteThreshold: 'none' | 'low' | 'medium';
}

/**
 * Default configuration
 */
export const DEFAULT_ENTELECHY_CONFIG: EntelechyConfig = {
  assessmentInterval: 30000, // 30 seconds
  snapshotLimit: 100,
  dimensionWeights: {
    ontological: 0.20,
    teleological: 0.20,
    cognitive: 0.25,
    integrative: 0.20,
    evolutionary: 0.15,
  },
  autoExecuteThreshold: 'low',
};

/**
 * Stage thresholds
 */
export const STAGE_THRESHOLDS: Record<ActualizationStage, [number, number]> = {
  [ActualizationStage.EMBRYONIC]: [0, 0.20],
  [ActualizationStage.NASCENT]: [0.20, 0.40],
  [ActualizationStage.EMERGING]: [0.40, 0.60],
  [ActualizationStage.ACTUALIZING]: [0.60, 0.80],
  [ActualizationStage.TRANSCENDENT]: [0.80, 1.00],
};

/**
 * Stage descriptions
 */
export const STAGE_DESCRIPTIONS: Record<ActualizationStage, string> = {
  [ActualizationStage.EMBRYONIC]: 
    "Basic components present, minimal integration. Beginning self-actualization process...",
  [ActualizationStage.NASCENT]: 
    "Components functioning, beginning coordination. Developing foundational awareness...",
  [ActualizationStage.EMERGING]: 
    "Integrated operation, developing self-awareness. Growing cognitive capabilities...",
  [ActualizationStage.ACTUALIZING]: 
    "Self-aware, actively self-optimizing. Approaching full potential...",
  [ActualizationStage.TRANSCENDENT]: 
    "Full self-realization achieved. Operating at transcendent capacity.",
};
