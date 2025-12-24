/**
 * Ontogenesis Types
 * 
 * Self-generating kernel factory for cognitive system evolution.
 * Based on the ONTOGENESIS.md and universal-kernel-generator.md specifications.
 * 
 * Core Concepts:
 * 1. Kernel: A self-contained unit of cognitive functionality
 * 2. Breeding: Combining kernels to create new variants
 * 3. Selection: Evaluating and selecting successful kernels
 * 4. Evolution: Iterative improvement through generations
 * 5. Emergence: Spontaneous development of new capabilities
 */

/**
 * Cognitive Kernel
 * A self-contained unit of cognitive functionality
 */
export interface CognitiveKernel {
  /** Unique identifier */
  id: string;
  
  /** Kernel name */
  name: string;
  
  /** Version */
  version: string;
  
  /** Kernel type */
  type: KernelType;
  
  /** Genetic lineage */
  lineage: KernelLineage;
  
  /** Kernel genome (configuration) */
  genome: KernelGenome;
  
  /** Fitness scores */
  fitness: FitnessScores;
  
  /** Operational state */
  state: KernelState;
  
  /** Creation timestamp */
  created: number;
  
  /** Last activation */
  lastActivated: number;
}

/**
 * Kernel types
 */
export type KernelType =
  | 'inference'      // LLM inference kernels
  | 'reasoning'      // Logical reasoning kernels
  | 'memory'         // Memory management kernels
  | 'perception'     // Input processing kernels
  | 'action'         // Output generation kernels
  | 'meta'           // Meta-cognitive kernels
  | 'integration'    // Cross-system integration kernels
  | 'specialized';   // Domain-specific kernels

/**
 * Kernel lineage (genetic history)
 */
export interface KernelLineage {
  /** Generation number */
  generation: number;
  
  /** Parent kernel IDs */
  parents: string[];
  
  /** Ancestor chain (up to 5 generations) */
  ancestors: string[];
  
  /** Breeding method used */
  breedingMethod: BreedingMethod;
  
  /** Mutations applied */
  mutations: Mutation[];
}

/**
 * Breeding methods
 */
export type BreedingMethod =
  | 'asexual'        // Single parent, mutation only
  | 'crossover'      // Two parents, gene mixing
  | 'multi-parent'   // Multiple parents
  | 'synthetic'      // Generated from specification
  | 'emergent';      // Spontaneously emerged

/**
 * Mutation record
 */
export interface Mutation {
  id: string;
  type: MutationType;
  target: string;
  magnitude: number;
  timestamp: number;
}

/**
 * Mutation types
 */
export type MutationType =
  | 'parameter'      // Parameter value change
  | 'structural'     // Structure modification
  | 'behavioral'     // Behavior change
  | 'deletion'       // Gene removal
  | 'insertion'      // Gene addition
  | 'duplication';   // Gene duplication

/**
 * Kernel genome (genetic configuration)
 */
export interface KernelGenome {
  /** Core genes */
  coreGenes: Gene[];
  
  /** Regulatory genes */
  regulatoryGenes: Gene[];
  
  /** Expression modifiers */
  expressionModifiers: ExpressionModifier[];
  
  /** Genome checksum */
  checksum: string;
}

/**
 * Gene
 */
export interface Gene {
  id: string;
  name: string;
  type: GeneType;
  value: unknown;
  mutable: boolean;
  expressionLevel: number;
}

/**
 * Gene types
 */
export type GeneType =
  | 'parameter'      // Numeric parameter
  | 'switch'         // Boolean toggle
  | 'selector'       // Choice from options
  | 'sequence'       // Ordered list
  | 'structure';     // Complex structure

/**
 * Expression modifier
 */
export interface ExpressionModifier {
  targetGene: string;
  condition: string;
  modifier: number;
}

/**
 * Fitness scores
 */
export interface FitnessScores {
  /** Overall fitness */
  overall: number;
  
  /** Performance score */
  performance: number;
  
  /** Efficiency score */
  efficiency: number;
  
  /** Reliability score */
  reliability: number;
  
  /** Adaptability score */
  adaptability: number;
  
  /** Innovation score */
  innovation: number;
  
  /** Evaluation count */
  evaluations: number;
  
  /** Last evaluation */
  lastEvaluated: number;
}

/**
 * Kernel state
 */
export enum KernelState {
  DORMANT = 'dormant',
  ACTIVE = 'active',
  BREEDING = 'breeding',
  EVALUATING = 'evaluating',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
}

/**
 * Kernel Population
 */
export interface KernelPopulation {
  /** Population ID */
  id: string;
  
  /** Population name */
  name: string;
  
  /** Current generation */
  generation: number;
  
  /** Active kernels */
  kernels: CognitiveKernel[];
  
  /** Population statistics */
  statistics: PopulationStatistics;
  
  /** Selection pressure */
  selectionPressure: number;
  
  /** Mutation rate */
  mutationRate: number;
  
  /** Population capacity */
  capacity: number;
}

/**
 * Population statistics
 */
export interface PopulationStatistics {
  /** Total kernels ever created */
  totalCreated: number;
  
  /** Currently active */
  activeCount: number;
  
  /** Archived count */
  archivedCount: number;
  
  /** Average fitness */
  averageFitness: number;
  
  /** Best fitness */
  bestFitness: number;
  
  /** Fitness trend */
  fitnessTrend: number[];
  
  /** Diversity index */
  diversityIndex: number;
}

/**
 * Breeding Request
 */
export interface BreedingRequest {
  /** Parent kernel IDs */
  parents: string[];
  
  /** Breeding method */
  method: BreedingMethod;
  
  /** Mutation rate override */
  mutationRate?: number;
  
  /** Target traits to emphasize */
  targetTraits?: string[];
  
  /** Number of offspring */
  offspringCount: number;
}

/**
 * Breeding Result
 */
export interface BreedingResult {
  /** Created offspring */
  offspring: CognitiveKernel[];
  
  /** Breeding success rate */
  successRate: number;
  
  /** Mutations applied */
  mutationsApplied: number;
  
  /** Novel genes created */
  novelGenes: number;
}

/**
 * Selection Criteria
 */
export interface SelectionCriteria {
  /** Minimum fitness threshold */
  minFitness: number;
  
  /** Trait weights */
  traitWeights: {
    performance: number;
    efficiency: number;
    reliability: number;
    adaptability: number;
    innovation: number;
  };
  
  /** Diversity bonus */
  diversityBonus: number;
  
  /** Age penalty */
  agePenalty: number;
}

/**
 * Evolution Configuration
 */
export interface EvolutionConfig {
  /** Generation interval in milliseconds */
  generationInterval: number;
  
  /** Population capacity */
  populationCapacity: number;
  
  /** Base mutation rate */
  baseMutationRate: number;
  
  /** Selection pressure (0-1) */
  selectionPressure: number;
  
  /** Elitism rate (top % preserved) */
  elitismRate: number;
  
  /** Crossover rate */
  crossoverRate: number;
  
  /** Enable spontaneous emergence */
  enableEmergence: boolean;
  
  /** Archive threshold (fitness below which kernels are archived) */
  archiveThreshold: number;
}

/**
 * Default evolution configuration
 */
export const DEFAULT_EVOLUTION_CONFIG: EvolutionConfig = {
  generationInterval: 300000, // 5 minutes
  populationCapacity: 50,
  baseMutationRate: 0.1,
  selectionPressure: 0.5,
  elitismRate: 0.1,
  crossoverRate: 0.7,
  enableEmergence: true,
  archiveThreshold: 0.3,
};

/**
 * Ontogenesis State
 */
export interface OntogenesisState {
  /** Active populations */
  populations: KernelPopulation[];
  
  /** Kernel archive */
  archive: CognitiveKernel[];
  
  /** Evolution configuration */
  config: EvolutionConfig;
  
  /** Current generation (global) */
  globalGeneration: number;
  
  /** Total kernels created */
  totalKernelsCreated: number;
  
  /** Emergence events */
  emergenceEvents: EmergenceEvent[];
  
  /** Is evolution running */
  isEvolving: boolean;
  
  /** Last evolution cycle */
  lastEvolutionCycle: number;
}

/**
 * Emergence Event
 */
export interface EmergenceEvent {
  id: string;
  timestamp: number;
  type: EmergenceType;
  description: string;
  kernelId?: string;
  significance: number;
}

/**
 * Emergence types
 */
export type EmergenceType =
  | 'capability'     // New capability emerged
  | 'behavior'       // New behavior pattern
  | 'structure'      // New structural organization
  | 'integration';   // New integration pattern

/**
 * Ontogenesis Event Types
 */
export type OntogenesisEventType =
  | 'kernel-created'
  | 'kernel-activated'
  | 'kernel-deprecated'
  | 'breeding-complete'
  | 'generation-complete'
  | 'emergence-detected'
  | 'population-updated';

/**
 * Ontogenesis Event
 */
export interface OntogenesisEvent {
  type: OntogenesisEventType;
  timestamp: number;
  data: unknown;
}

/**
 * Event Listener
 */
export type OntogenesisEventListener = (event: OntogenesisEvent) => void;

/**
 * Kernel Template
 */
export interface KernelTemplate {
  name: string;
  type: KernelType;
  baseGenome: Partial<KernelGenome>;
  description: string;
}

/**
 * Predefined kernel templates
 */
export const KERNEL_TEMPLATES: KernelTemplate[] = [
  {
    name: 'Basic Inference',
    type: 'inference',
    baseGenome: {
      coreGenes: [
        { id: 'temperature', name: 'Temperature', type: 'parameter', value: 0.7, mutable: true, expressionLevel: 1 },
        { id: 'maxTokens', name: 'Max Tokens', type: 'parameter', value: 2048, mutable: true, expressionLevel: 1 },
        { id: 'topP', name: 'Top P', type: 'parameter', value: 0.9, mutable: true, expressionLevel: 1 },
      ],
      regulatoryGenes: [],
      expressionModifiers: [],
      checksum: '',
    },
    description: 'Basic LLM inference kernel',
  },
  {
    name: 'Analytical Reasoning',
    type: 'reasoning',
    baseGenome: {
      coreGenes: [
        { id: 'depth', name: 'Reasoning Depth', type: 'parameter', value: 3, mutable: true, expressionLevel: 1 },
        { id: 'breadth', name: 'Exploration Breadth', type: 'parameter', value: 5, mutable: true, expressionLevel: 1 },
        { id: 'rigor', name: 'Logical Rigor', type: 'parameter', value: 0.8, mutable: true, expressionLevel: 1 },
      ],
      regulatoryGenes: [],
      expressionModifiers: [],
      checksum: '',
    },
    description: 'Analytical reasoning kernel',
  },
  {
    name: 'Working Memory',
    type: 'memory',
    baseGenome: {
      coreGenes: [
        { id: 'capacity', name: 'Capacity', type: 'parameter', value: 7, mutable: true, expressionLevel: 1 },
        { id: 'decay', name: 'Decay Rate', type: 'parameter', value: 0.1, mutable: true, expressionLevel: 1 },
        { id: 'consolidation', name: 'Consolidation Rate', type: 'parameter', value: 0.3, mutable: true, expressionLevel: 1 },
      ],
      regulatoryGenes: [],
      expressionModifiers: [],
      checksum: '',
    },
    description: 'Working memory management kernel',
  },
  {
    name: 'Meta-Cognitive Monitor',
    type: 'meta',
    baseGenome: {
      coreGenes: [
        { id: 'introspectionDepth', name: 'Introspection Depth', type: 'parameter', value: 2, mutable: true, expressionLevel: 1 },
        { id: 'selfAwareness', name: 'Self-Awareness Level', type: 'parameter', value: 0.5, mutable: true, expressionLevel: 1 },
        { id: 'adaptability', name: 'Adaptability', type: 'parameter', value: 0.6, mutable: true, expressionLevel: 1 },
      ],
      regulatoryGenes: [],
      expressionModifiers: [],
      checksum: '',
    },
    description: 'Meta-cognitive monitoring kernel',
  },
];
