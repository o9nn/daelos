/**
 * Entelechy Service
 * 
 * Implements the five-dimensional vital actualization framework.
 * Monitors and tracks the system's progress toward self-realization.
 * 
 * The service continuously assesses five dimensions:
 * 1. Ontological (Being)
 * 2. Teleological (Purpose)
 * 3. Cognitive (Thinking)
 * 4. Integrative (Unity)
 * 5. Evolutionary (Growth)
 */

import {
  type EntelechyState,
  type EntelechyDimensions,
  type DimensionScore,
  type DimensionFactor,
  type EntelechyRecommendation,
  type EntelechySnapshot,
  type EntelechyEvent,
  type EntelechyEventType,
  type EntelechyEventListener,
  type EntelechyConfig,
  ActualizationStage,
  DEFAULT_ENTELECHY_CONFIG,
  STAGE_THRESHOLDS,
  STAGE_DESCRIPTIONS,
} from "./types";

import { getNPU } from "../NPU";

/**
 * Entelechy Service Singleton
 */
export class EntelechyService {
  private static instance: EntelechyService | null = null;
  
  private state: EntelechyState;
  private config: EntelechyConfig;
  private eventListeners: Map<EntelechyEventType, Set<EntelechyEventListener>> = new Map();
  private assessmentInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  
  private constructor(config: Partial<EntelechyConfig> = {}) {
    this.config = { ...DEFAULT_ENTELECHY_CONFIG, ...config };
    this.state = this.createInitialState();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<EntelechyConfig>): EntelechyService {
    if (!EntelechyService.instance) {
      EntelechyService.instance = new EntelechyService(config);
    }
    return EntelechyService.instance;
  }
  
  /**
   * Start the entelechy service
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    console.log('Entelechy Service: Starting...');
    this.isRunning = true;
    
    // Perform initial assessment
    await this.assess();
    
    // Start periodic assessment
    this.assessmentInterval = setInterval(
      () => this.assess(),
      this.config.assessmentInterval
    );
    
    console.log('Entelechy Service: Running');
  }
  
  /**
   * Stop the entelechy service
   */
  stop(): void {
    if (this.assessmentInterval) {
      clearInterval(this.assessmentInterval);
      this.assessmentInterval = null;
    }
    this.isRunning = false;
    console.log('Entelechy Service: Stopped');
  }
  
  /**
   * Perform a full assessment of all dimensions
   */
  async assess(): Promise<EntelechyState> {
    const startTime = Date.now();
    
    // Assess each dimension
    const [ontological, teleological, cognitive, integrative, evolutionary] = 
      await Promise.all([
        this.assessOntological(),
        this.assessTeleological(),
        this.assessCognitive(),
        this.assessIntegrative(),
        this.assessEvolutionary(),
      ]);
    
    // Update dimensions
    this.state.dimensions = {
      ontological,
      teleological,
      cognitive,
      integrative,
      evolutionary,
    };
    
    // Calculate overall score
    this.state.overallScore = this.calculateOverallScore();
    
    // Determine stage
    const previousStage = this.state.stage;
    this.state.stage = this.determineStage(this.state.overallScore);
    
    // Generate recommendations
    this.state.recommendations = this.generateRecommendations();
    
    // Create snapshot
    this.addSnapshot();
    
    // Update timestamps
    this.state.lastAssessment = Date.now();
    this.state.uptime = Date.now() - this.state.snapshots[0]?.timestamp || 0;
    
    // Emit events
    this.emitEvent('assessment-complete', {
      duration: Date.now() - startTime,
      overallScore: this.state.overallScore,
      stage: this.state.stage,
    });
    
    if (previousStage !== this.state.stage) {
      this.emitEvent('stage-changed', {
        from: previousStage,
        to: this.state.stage,
        description: STAGE_DESCRIPTIONS[this.state.stage],
      });
    }
    
    return this.state;
  }
  
  /**
   * Get current state
   */
  getState(): EntelechyState {
    return { ...this.state };
  }
  
  /**
   * Get current stage description
   */
  getStageDescription(): string {
    return STAGE_DESCRIPTIONS[this.state.stage];
  }
  
  /**
   * Add event listener
   */
  addEventListener(type: EntelechyEventType, listener: EntelechyEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(type: EntelechyEventType, listener: EntelechyEventListener): void {
    this.eventListeners.get(type)?.delete(listener);
  }
  
  // Private methods
  
  private createInitialState(): EntelechyState {
    const emptyDimension = (): DimensionScore => ({
      value: 0,
      trend: 0,
      history: [],
      confidence: 0,
      lastUpdated: Date.now(),
      factors: [],
    });
    
    return {
      dimensions: {
        ontological: emptyDimension(),
        teleological: emptyDimension(),
        cognitive: emptyDimension(),
        integrative: emptyDimension(),
        evolutionary: emptyDimension(),
      },
      overallScore: 0,
      stage: ActualizationStage.EMBRYONIC,
      recommendations: [],
      snapshots: [],
      uptime: 0,
      lastAssessment: 0,
    };
  }
  
  private async assessOntological(): Promise<DimensionScore> {
    const factors: DimensionFactor[] = [];
    
    // Factor 1: Memory availability
    const memoryFactor = this.assessMemory();
    factors.push(memoryFactor);
    
    // Factor 2: Storage health
    const storageFactor = await this.assessStorage();
    factors.push(storageFactor);
    
    // Factor 3: Process stability
    const processFactor = this.assessProcessStability();
    factors.push(processFactor);
    
    // Factor 4: Component health
    const componentFactor = this.assessComponentHealth();
    factors.push(componentFactor);
    
    // Calculate weighted average
    const value = this.calculateWeightedAverage(factors);
    
    return this.createDimensionScore(value, factors, 'ontological');
  }
  
  private async assessTeleological(): Promise<DimensionScore> {
    const factors: DimensionFactor[] = [];
    
    // Factor 1: Task completion rate
    factors.push({
      name: 'taskCompletion',
      weight: 0.3,
      value: 0.5, // Placeholder - would track actual task completions
      description: 'Rate of successful task completions',
    });
    
    // Factor 2: User engagement
    factors.push({
      name: 'userEngagement',
      weight: 0.25,
      value: 0.4, // Placeholder - would track user interactions
      description: 'Level of user engagement with the system',
    });
    
    // Factor 3: Goal alignment
    factors.push({
      name: 'goalAlignment',
      weight: 0.25,
      value: 0.45, // Placeholder - would measure goal achievement
      description: 'Alignment between actions and stated goals',
    });
    
    // Factor 4: Purpose clarity
    factors.push({
      name: 'purposeClarity',
      weight: 0.2,
      value: 0.5, // Placeholder - would assess purpose definition
      description: 'Clarity of system purpose and direction',
    });
    
    const value = this.calculateWeightedAverage(factors);
    return this.createDimensionScore(value, factors, 'teleological');
  }
  
  private async assessCognitive(): Promise<DimensionScore> {
    const factors: DimensionFactor[] = [];
    
    // Factor 1: NPU availability and performance
    const npuFactor = this.assessNPU();
    factors.push(npuFactor);
    
    // Factor 2: Inference quality
    factors.push({
      name: 'inferenceQuality',
      weight: 0.3,
      value: 0.4, // Placeholder - would measure inference accuracy
      description: 'Quality of LLM inference outputs',
    });
    
    // Factor 3: Pattern recognition
    factors.push({
      name: 'patternRecognition',
      weight: 0.2,
      value: 0.35, // Placeholder - would track pattern detection
      description: 'Ability to recognize and utilize patterns',
    });
    
    // Factor 4: Learning progress
    factors.push({
      name: 'learningProgress',
      weight: 0.2,
      value: 0.3, // Placeholder - would measure learning metrics
      description: 'Progress in learning from interactions',
    });
    
    const value = this.calculateWeightedAverage(factors);
    return this.createDimensionScore(value, factors, 'cognitive');
  }
  
  private async assessIntegrative(): Promise<DimensionScore> {
    const factors: DimensionFactor[] = [];
    
    // Factor 1: Component communication
    factors.push({
      name: 'componentCommunication',
      weight: 0.3,
      value: 0.5, // Placeholder - would measure inter-component messaging
      description: 'Quality of communication between components',
    });
    
    // Factor 2: State consistency
    factors.push({
      name: 'stateConsistency',
      weight: 0.25,
      value: 0.55, // Placeholder - would check state synchronization
      description: 'Consistency of state across components',
    });
    
    // Factor 3: Gestalt formation
    factors.push({
      name: 'gestaltFormation',
      weight: 0.25,
      value: 0.4, // Placeholder - would assess emergent coherence
      description: 'Formation of coherent wholes from parts',
    });
    
    // Factor 4: Emergent behaviors
    factors.push({
      name: 'emergentBehaviors',
      weight: 0.2,
      value: 0.35, // Placeholder - would detect emergent patterns
      description: 'Presence of beneficial emergent behaviors',
    });
    
    const value = this.calculateWeightedAverage(factors);
    return this.createDimensionScore(value, factors, 'integrative');
  }
  
  private async assessEvolutionary(): Promise<DimensionScore> {
    const factors: DimensionFactor[] = [];
    
    // Factor 1: Kernel evolution
    factors.push({
      name: 'kernelEvolution',
      weight: 0.3,
      value: 0.3, // Placeholder - would track kernel breeding
      description: 'Progress in kernel evolution and breeding',
    });
    
    // Factor 2: Capability expansion
    factors.push({
      name: 'capabilityExpansion',
      weight: 0.25,
      value: 0.35, // Placeholder - would measure new capabilities
      description: 'Rate of capability expansion',
    });
    
    // Factor 3: Adaptation rate
    factors.push({
      name: 'adaptationRate',
      weight: 0.25,
      value: 0.4, // Placeholder - would measure adaptation speed
      description: 'Speed of adaptation to new situations',
    });
    
    // Factor 4: Innovation metrics
    factors.push({
      name: 'innovationMetrics',
      weight: 0.2,
      value: 0.25, // Placeholder - would track novel solutions
      description: 'Generation of novel solutions and approaches',
    });
    
    const value = this.calculateWeightedAverage(factors);
    return this.createDimensionScore(value, factors, 'evolutionary');
  }
  
  // Assessment helpers
  
  private assessMemory(): DimensionFactor {
    let value = 0.5;
    
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memory) {
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        value = Math.max(0, 1 - usage);
      }
    }
    
    return {
      name: 'memoryAvailability',
      weight: 0.25,
      value,
      description: 'Available memory headroom',
    };
  }
  
  private async assessStorage(): Promise<DimensionFactor> {
    let value = 0.5;
    
    if (typeof navigator !== 'undefined' && 'storage' in navigator) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota && estimate.usage) {
          const usage = estimate.usage / estimate.quota;
          value = Math.max(0, 1 - usage);
        }
      } catch {
        // Storage API not available
      }
    }
    
    return {
      name: 'storageHealth',
      weight: 0.25,
      value,
      description: 'Storage availability and health',
    };
  }
  
  private assessProcessStability(): DimensionFactor {
    // In browser context, we assess based on error rates and performance
    const value = 0.7; // Placeholder - would track actual errors
    
    return {
      name: 'processStability',
      weight: 0.25,
      value,
      description: 'Stability of running processes',
    };
  }
  
  private assessComponentHealth(): DimensionFactor {
    // Check health of registered components
    const value = 0.6; // Placeholder - would check actual component status
    
    return {
      name: 'componentHealth',
      weight: 0.25,
      value,
      description: 'Health of system components',
    };
  }
  
  private assessNPU(): DimensionFactor {
    try {
      const npu = getNPU();
      const state = npu.getState();
      
      let value = 0;
      
      // Check initialization
      if (state.isInitialized) {
        value += 0.3;
      }
      
      // Check model loaded
      if (state.currentModel) {
        value += 0.3;
      }
      
      // Check telemetry
      const telemetry = npu.getTelemetry();
      if (telemetry.totalInferences > 0) {
        value += 0.2;
        
        // Bonus for good performance
        if (telemetry.tokensPerSecond > 10) {
          value += 0.2;
        }
      }
      
      return {
        name: 'npuPerformance',
        weight: 0.3,
        value: Math.min(1, value),
        description: 'NPU availability and performance',
      };
    } catch {
      return {
        name: 'npuPerformance',
        weight: 0.3,
        value: 0,
        description: 'NPU availability and performance',
      };
    }
  }
  
  private calculateWeightedAverage(factors: DimensionFactor[]): number {
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedSum = factors.reduce((sum, f) => sum + f.value * f.weight, 0);
    return weightedSum / totalWeight;
  }
  
  private createDimensionScore(
    value: number,
    factors: DimensionFactor[],
    dimension: keyof EntelechyDimensions
  ): DimensionScore {
    const previousScore = this.state.dimensions[dimension];
    const history = [...previousScore.history, value].slice(-20);
    
    // Calculate trend
    let trend: -1 | 0 | 1 = 0;
    if (history.length >= 3) {
      const recent = history.slice(-3);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      if (value > avg + 0.05) trend = 1;
      else if (value < avg - 0.05) trend = -1;
    }
    
    // Calculate confidence based on factor consistency
    const variance = factors.reduce((sum, f) => {
      return sum + Math.pow(f.value - value, 2) * f.weight;
    }, 0);
    const confidence = Math.max(0.5, 1 - Math.sqrt(variance));
    
    return {
      value,
      trend,
      history,
      confidence,
      lastUpdated: Date.now(),
      factors,
    };
  }
  
  private calculateOverallScore(): number {
    const { dimensions } = this.state;
    const weights = this.config.dimensionWeights;
    
    return (
      dimensions.ontological.value * weights.ontological +
      dimensions.teleological.value * weights.teleological +
      dimensions.cognitive.value * weights.cognitive +
      dimensions.integrative.value * weights.integrative +
      dimensions.evolutionary.value * weights.evolutionary
    );
  }
  
  private determineStage(score: number): ActualizationStage {
    for (const [stage, [min, max]] of Object.entries(STAGE_THRESHOLDS)) {
      if (score >= min && score < max) {
        return stage as ActualizationStage;
      }
    }
    return ActualizationStage.TRANSCENDENT;
  }
  
  private generateRecommendations(): EntelechyRecommendation[] {
    const recommendations: EntelechyRecommendation[] = [];
    const { dimensions } = this.state;
    
    // Find lowest dimension
    const dimensionEntries = Object.entries(dimensions) as [keyof EntelechyDimensions, DimensionScore][];
    const sorted = dimensionEntries.sort((a, b) => a[1].value - b[1].value);
    
    for (const [dimension, score] of sorted.slice(0, 3)) {
      if (score.value < 0.6) {
        // Find lowest factor
        const lowestFactor = score.factors.reduce((min, f) => 
          f.value < min.value ? f : min
        );
        
        recommendations.push({
          id: `rec-${dimension}-${Date.now()}`,
          dimension,
          priority: score.value < 0.3 ? 'critical' : score.value < 0.5 ? 'high' : 'medium',
          title: `Improve ${dimension} dimension`,
          description: `The ${dimension} dimension is at ${(score.value * 100).toFixed(1)}%. ` +
            `Focus on improving ${lowestFactor.name}.`,
          action: `optimize-${dimension}`,
          expectedImpact: 0.1,
          autoExecutable: false,
        });
      }
    }
    
    return recommendations;
  }
  
  private addSnapshot(): void {
    const snapshot: EntelechySnapshot = {
      timestamp: Date.now(),
      overallScore: this.state.overallScore,
      dimensions: {
        ontological: this.state.dimensions.ontological.value,
        teleological: this.state.dimensions.teleological.value,
        cognitive: this.state.dimensions.cognitive.value,
        integrative: this.state.dimensions.integrative.value,
        evolutionary: this.state.dimensions.evolutionary.value,
      },
    };
    
    this.state.snapshots.push(snapshot);
    
    // Limit snapshot history
    if (this.state.snapshots.length > this.config.snapshotLimit) {
      this.state.snapshots = this.state.snapshots.slice(-this.config.snapshotLimit);
    }
  }
  
  private emitEvent(type: EntelechyEventType, data: unknown): void {
    const event: EntelechyEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    this.eventListeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Entelechy event listener error:', error);
      }
    });
  }
}

// Export singleton getter
export const getEntelechy = (config?: Partial<EntelechyConfig>): EntelechyService => 
  EntelechyService.getInstance(config);
