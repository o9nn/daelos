/**
 * Ontogenesis Service
 * 
 * Self-generating kernel factory for cognitive system evolution.
 * Manages kernel populations, breeding, selection, and evolution.
 * 
 * Core Functions:
 * 1. Kernel creation and management
 * 2. Breeding and crossover
 * 3. Mutation and variation
 * 4. Fitness evaluation
 * 5. Selection and evolution
 * 6. Emergence detection
 */

import {
  type OntogenesisState,
  type CognitiveKernel,
  type KernelType,
  type KernelPopulation,
  type KernelGenome,
  type KernelLineage,
  type FitnessScores,
  type Gene,
  type Mutation,
  type MutationType,
  type BreedingMethod,
  type BreedingRequest,
  type BreedingResult,
  type SelectionCriteria,
  type EvolutionConfig,
  type EmergenceEvent,
  type EmergenceType,
  type OntogenesisEvent,
  type OntogenesisEventType,
  type OntogenesisEventListener,
  type KernelTemplate,
  KernelState,
  DEFAULT_EVOLUTION_CONFIG,
  KERNEL_TEMPLATES,
} from "./types";

/**
 * Ontogenesis Service Singleton
 */
export class OntogenesisService {
  private static instance: OntogenesisService | null = null;
  
  private state: OntogenesisState;
  private eventListeners: Map<OntogenesisEventType, Set<OntogenesisEventListener>> = new Map();
  private evolutionInterval: ReturnType<typeof setInterval> | null = null;
  
  private constructor(config: Partial<EvolutionConfig> = {}) {
    this.state = this.createInitialState({ ...DEFAULT_EVOLUTION_CONFIG, ...config });
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<EvolutionConfig>): OntogenesisService {
    if (!OntogenesisService.instance) {
      OntogenesisService.instance = new OntogenesisService(config);
    }
    return OntogenesisService.instance;
  }
  
  /**
   * Start evolution
   */
  startEvolution(): void {
    if (this.state.isEvolving) return;
    
    console.log('Ontogenesis Service: Starting evolution...');
    this.state.isEvolving = true;
    
    // Initialize populations if empty
    if (this.state.populations.length === 0) {
      this.initializePopulations();
    }
    
    // Start evolution cycle
    this.evolutionInterval = setInterval(
      () => this.evolutionCycle(),
      this.state.config.generationInterval
    );
    
    console.log('Ontogenesis Service: Evolution running');
  }
  
  /**
   * Stop evolution
   */
  stopEvolution(): void {
    if (this.evolutionInterval) {
      clearInterval(this.evolutionInterval);
      this.evolutionInterval = null;
    }
    this.state.isEvolving = false;
    console.log('Ontogenesis Service: Evolution stopped');
  }
  
  /**
   * Get current state
   */
  getState(): OntogenesisState {
    return { ...this.state };
  }
  
  /**
   * Create a new kernel from template
   */
  createKernel(template: KernelTemplate, customGenome?: Partial<KernelGenome>): CognitiveKernel {
    const id = this.generateKernelId();
    
    const genome: KernelGenome = {
      coreGenes: [...(template.baseGenome.coreGenes || [])],
      regulatoryGenes: [...(template.baseGenome.regulatoryGenes || [])],
      expressionModifiers: [...(template.baseGenome.expressionModifiers || [])],
      checksum: '',
    };
    
    // Apply custom genome modifications
    if (customGenome) {
      if (customGenome.coreGenes) {
        genome.coreGenes = [...genome.coreGenes, ...customGenome.coreGenes];
      }
      if (customGenome.regulatoryGenes) {
        genome.regulatoryGenes = [...genome.regulatoryGenes, ...customGenome.regulatoryGenes];
      }
    }
    
    genome.checksum = this.calculateChecksum(genome);
    
    const kernel: CognitiveKernel = {
      id,
      name: `${template.name}-${id.slice(-4)}`,
      version: '1.0.0',
      type: template.type,
      lineage: {
        generation: 0,
        parents: [],
        ancestors: [],
        breedingMethod: 'synthetic',
        mutations: [],
      },
      genome,
      fitness: this.createInitialFitness(),
      state: KernelState.DORMANT,
      created: Date.now(),
      lastActivated: 0,
    };
    
    this.state.totalKernelsCreated++;
    this.emitEvent('kernel-created', { kernel });
    
    return kernel;
  }
  
  /**
   * Breed kernels to create offspring
   */
  breed(request: BreedingRequest): BreedingResult {
    const parents = request.parents
      .map(id => this.findKernel(id))
      .filter((k): k is CognitiveKernel => k !== null);
    
    if (parents.length < 1) {
      return {
        offspring: [],
        successRate: 0,
        mutationsApplied: 0,
        novelGenes: 0,
      };
    }
    
    const offspring: CognitiveKernel[] = [];
    let totalMutations = 0;
    let novelGenes = 0;
    
    for (let i = 0; i < request.offspringCount; i++) {
      let childGenome: KernelGenome;
      
      switch (request.method) {
        case 'asexual':
          childGenome = this.asexualReproduction(parents[0].genome);
          break;
        case 'crossover':
          childGenome = this.crossover(
            parents[0].genome,
            parents[1]?.genome || parents[0].genome
          );
          break;
        case 'multi-parent':
          childGenome = this.multiParentBreeding(parents.map(p => p.genome));
          break;
        default:
          childGenome = this.asexualReproduction(parents[0].genome);
      }
      
      // Apply mutations
      const mutationRate = request.mutationRate ?? this.state.config.baseMutationRate;
      const { genome: mutatedGenome, mutations } = this.applyMutations(childGenome, mutationRate);
      totalMutations += mutations.length;
      
      // Count novel genes
      novelGenes += mutations.filter(m => m.type === 'insertion').length;
      
      // Create child kernel
      const child: CognitiveKernel = {
        id: this.generateKernelId(),
        name: `${parents[0].type}-gen${this.state.globalGeneration + 1}-${i}`,
        version: '1.0.0',
        type: parents[0].type,
        lineage: {
          generation: Math.max(...parents.map(p => p.lineage.generation)) + 1,
          parents: parents.map(p => p.id),
          ancestors: this.buildAncestorChain(parents),
          breedingMethod: request.method,
          mutations,
        },
        genome: mutatedGenome,
        fitness: this.createInitialFitness(),
        state: KernelState.DORMANT,
        created: Date.now(),
        lastActivated: 0,
      };
      
      offspring.push(child);
      this.state.totalKernelsCreated++;
    }
    
    this.emitEvent('breeding-complete', {
      parents: parents.map(p => p.id),
      offspring: offspring.map(o => o.id),
      method: request.method,
    });
    
    return {
      offspring,
      successRate: offspring.length / request.offspringCount,
      mutationsApplied: totalMutations,
      novelGenes,
    };
  }
  
  /**
   * Evaluate kernel fitness
   */
  evaluateFitness(kernelId: string, scores: Partial<FitnessScores>): FitnessScores | null {
    const kernel = this.findKernel(kernelId);
    if (!kernel) return null;
    
    // Update scores
    if (scores.performance !== undefined) kernel.fitness.performance = scores.performance;
    if (scores.efficiency !== undefined) kernel.fitness.efficiency = scores.efficiency;
    if (scores.reliability !== undefined) kernel.fitness.reliability = scores.reliability;
    if (scores.adaptability !== undefined) kernel.fitness.adaptability = scores.adaptability;
    if (scores.innovation !== undefined) kernel.fitness.innovation = scores.innovation;
    
    // Calculate overall fitness
    kernel.fitness.overall = this.calculateOverallFitness(kernel.fitness);
    kernel.fitness.evaluations++;
    kernel.fitness.lastEvaluated = Date.now();
    
    return kernel.fitness;
  }
  
  /**
   * Activate a kernel
   */
  activateKernel(kernelId: string): boolean {
    const kernel = this.findKernel(kernelId);
    if (!kernel || kernel.state === KernelState.DEPRECATED) return false;
    
    kernel.state = KernelState.ACTIVE;
    kernel.lastActivated = Date.now();
    
    this.emitEvent('kernel-activated', { kernelId });
    return true;
  }
  
  /**
   * Deprecate a kernel
   */
  deprecateKernel(kernelId: string): boolean {
    const kernel = this.findKernel(kernelId);
    if (!kernel) return false;
    
    kernel.state = KernelState.DEPRECATED;
    
    this.emitEvent('kernel-deprecated', { kernelId });
    return true;
  }
  
  /**
   * Get population by type
   */
  getPopulation(type: KernelType): KernelPopulation | null {
    return this.state.populations.find(p => p.name === type) || null;
  }
  
  /**
   * Get best kernel by type
   */
  getBestKernel(type: KernelType): CognitiveKernel | null {
    const population = this.getPopulation(type);
    if (!population || population.kernels.length === 0) return null;
    
    return population.kernels.reduce((best, current) =>
      current.fitness.overall > best.fitness.overall ? current : best
    );
  }
  
  /**
   * Add event listener
   */
  addEventListener(type: OntogenesisEventType, listener: OntogenesisEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(type: OntogenesisEventType, listener: OntogenesisEventListener): void {
    this.eventListeners.get(type)?.delete(listener);
  }
  
  // Private methods
  
  private createInitialState(config: EvolutionConfig): OntogenesisState {
    return {
      populations: [],
      archive: [],
      config,
      globalGeneration: 0,
      totalKernelsCreated: 0,
      emergenceEvents: [],
      isEvolving: false,
      lastEvolutionCycle: 0,
    };
  }
  
  private initializePopulations(): void {
    // Create populations for each kernel type
    const types: KernelType[] = ['inference', 'reasoning', 'memory', 'meta'];
    
    for (const type of types) {
      const population: KernelPopulation = {
        id: `pop-${type}`,
        name: type,
        generation: 0,
        kernels: [],
        statistics: {
          totalCreated: 0,
          activeCount: 0,
          archivedCount: 0,
          averageFitness: 0,
          bestFitness: 0,
          fitnessTrend: [],
          diversityIndex: 0,
        },
        selectionPressure: this.state.config.selectionPressure,
        mutationRate: this.state.config.baseMutationRate,
        capacity: Math.floor(this.state.config.populationCapacity / types.length),
      };
      
      // Create initial kernels from templates
      const template = KERNEL_TEMPLATES.find(t => t.type === type);
      if (template) {
        for (let i = 0; i < 5; i++) {
          const kernel = this.createKernel(template);
          population.kernels.push(kernel);
          population.statistics.totalCreated++;
        }
      }
      
      this.state.populations.push(population);
    }
  }
  
  private evolutionCycle(): void {
    console.log(`Ontogenesis: Evolution cycle ${this.state.globalGeneration + 1}`);
    
    for (const population of this.state.populations) {
      // Selection
      this.performSelection(population);
      
      // Breeding
      this.performBreeding(population);
      
      // Update statistics
      this.updatePopulationStatistics(population);
      
      population.generation++;
    }
    
    // Check for emergence
    if (this.state.config.enableEmergence) {
      this.checkForEmergence();
    }
    
    this.state.globalGeneration++;
    this.state.lastEvolutionCycle = Date.now();
    
    this.emitEvent('generation-complete', {
      generation: this.state.globalGeneration,
      populations: this.state.populations.map(p => ({
        name: p.name,
        size: p.kernels.length,
        avgFitness: p.statistics.averageFitness,
      })),
    });
  }
  
  private performSelection(population: KernelPopulation): void {
    const criteria: SelectionCriteria = {
      minFitness: this.state.config.archiveThreshold,
      traitWeights: {
        performance: 0.3,
        efficiency: 0.2,
        reliability: 0.2,
        adaptability: 0.15,
        innovation: 0.15,
      },
      diversityBonus: 0.1,
      agePenalty: 0.05,
    };
    
    // Sort by fitness
    population.kernels.sort((a, b) => b.fitness.overall - a.fitness.overall);
    
    // Archive low-fitness kernels
    const toArchive = population.kernels.filter(
      k => k.fitness.overall < criteria.minFitness && k.fitness.evaluations > 0
    );
    
    for (const kernel of toArchive) {
      kernel.state = KernelState.ARCHIVED;
      this.state.archive.push(kernel);
      population.statistics.archivedCount++;
    }
    
    // Remove archived from population
    population.kernels = population.kernels.filter(
      k => k.state !== KernelState.ARCHIVED
    );
  }
  
  private performBreeding(population: KernelPopulation): void {
    const eliteCount = Math.ceil(population.kernels.length * this.state.config.elitismRate);
    const elite = population.kernels.slice(0, eliteCount);
    
    // Calculate how many new kernels needed
    const targetSize = population.capacity;
    const currentSize = population.kernels.length;
    const newKernelsNeeded = Math.max(0, targetSize - currentSize);
    
    if (newKernelsNeeded === 0) return;
    
    // Breed new kernels
    for (let i = 0; i < newKernelsNeeded; i++) {
      const method: BreedingMethod = Math.random() < this.state.config.crossoverRate
        ? 'crossover'
        : 'asexual';
      
      const parents = method === 'crossover' && elite.length >= 2
        ? [elite[Math.floor(Math.random() * elite.length)].id, elite[Math.floor(Math.random() * elite.length)].id]
        : [elite[Math.floor(Math.random() * elite.length)].id];
      
      const result = this.breed({
        parents,
        method,
        offspringCount: 1,
      });
      
      if (result.offspring.length > 0) {
        population.kernels.push(result.offspring[0]);
        population.statistics.totalCreated++;
      }
    }
  }
  
  private updatePopulationStatistics(population: KernelPopulation): void {
    const kernels = population.kernels;
    
    if (kernels.length === 0) {
      population.statistics.averageFitness = 0;
      population.statistics.bestFitness = 0;
      return;
    }
    
    // Calculate average fitness
    const totalFitness = kernels.reduce((sum, k) => sum + k.fitness.overall, 0);
    population.statistics.averageFitness = totalFitness / kernels.length;
    
    // Find best fitness
    population.statistics.bestFitness = Math.max(...kernels.map(k => k.fitness.overall));
    
    // Update fitness trend
    population.statistics.fitnessTrend.push(population.statistics.averageFitness);
    if (population.statistics.fitnessTrend.length > 20) {
      population.statistics.fitnessTrend = population.statistics.fitnessTrend.slice(-20);
    }
    
    // Calculate diversity index (simplified)
    const uniqueGenomes = new Set(kernels.map(k => k.genome.checksum));
    population.statistics.diversityIndex = uniqueGenomes.size / kernels.length;
    
    // Update active count
    population.statistics.activeCount = kernels.filter(
      k => k.state === KernelState.ACTIVE
    ).length;
    
    this.emitEvent('population-updated', {
      populationId: population.id,
      statistics: population.statistics,
    });
  }
  
  private checkForEmergence(): void {
    // Check for significant fitness improvements
    for (const population of this.state.populations) {
      const trend = population.statistics.fitnessTrend;
      if (trend.length >= 5) {
        const recent = trend.slice(-5);
        const older = trend.slice(-10, -5);
        
        if (older.length > 0) {
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
          
          // Significant improvement detected
          if (recentAvg > olderAvg * 1.2) {
            const event: EmergenceEvent = {
              id: `emerge-${Date.now()}`,
              timestamp: Date.now(),
              type: 'capability',
              description: `Significant capability improvement in ${population.name} population`,
              significance: (recentAvg - olderAvg) / olderAvg,
            };
            
            this.state.emergenceEvents.push(event);
            this.emitEvent('emergence-detected', { event });
          }
        }
      }
    }
    
    // Check for novel gene combinations
    // (Simplified - would be more sophisticated in production)
  }
  
  private asexualReproduction(parentGenome: KernelGenome): KernelGenome {
    return {
      coreGenes: parentGenome.coreGenes.map(g => ({ ...g })),
      regulatoryGenes: parentGenome.regulatoryGenes.map(g => ({ ...g })),
      expressionModifiers: [...parentGenome.expressionModifiers],
      checksum: '',
    };
  }
  
  private crossover(genome1: KernelGenome, genome2: KernelGenome): KernelGenome {
    const crossoverPoint = Math.floor(Math.random() * genome1.coreGenes.length);
    
    return {
      coreGenes: [
        ...genome1.coreGenes.slice(0, crossoverPoint).map(g => ({ ...g })),
        ...genome2.coreGenes.slice(crossoverPoint).map(g => ({ ...g })),
      ],
      regulatoryGenes: Math.random() < 0.5
        ? genome1.regulatoryGenes.map(g => ({ ...g }))
        : genome2.regulatoryGenes.map(g => ({ ...g })),
      expressionModifiers: [
        ...genome1.expressionModifiers.slice(0, Math.floor(genome1.expressionModifiers.length / 2)),
        ...genome2.expressionModifiers.slice(Math.floor(genome2.expressionModifiers.length / 2)),
      ],
      checksum: '',
    };
  }
  
  private multiParentBreeding(genomes: KernelGenome[]): KernelGenome {
    // Average genes from all parents
    const coreGenes: Gene[] = [];
    
    if (genomes.length > 0 && genomes[0].coreGenes.length > 0) {
      for (let i = 0; i < genomes[0].coreGenes.length; i++) {
        const parentGene = genomes[Math.floor(Math.random() * genomes.length)].coreGenes[i];
        if (parentGene) {
          coreGenes.push({ ...parentGene });
        }
      }
    }
    
    return {
      coreGenes,
      regulatoryGenes: genomes[Math.floor(Math.random() * genomes.length)]?.regulatoryGenes.map(g => ({ ...g })) || [],
      expressionModifiers: [],
      checksum: '',
    };
  }
  
  private applyMutations(
    genome: KernelGenome,
    mutationRate: number
  ): { genome: KernelGenome; mutations: Mutation[] } {
    const mutations: Mutation[] = [];
    
    // Mutate core genes
    for (const gene of genome.coreGenes) {
      if (gene.mutable && Math.random() < mutationRate) {
        const mutation = this.mutateGene(gene);
        if (mutation) {
          mutations.push(mutation);
        }
      }
    }
    
    // Possibly add new gene
    if (Math.random() < mutationRate * 0.1) {
      const newGene: Gene = {
        id: `gene-${Date.now()}`,
        name: 'Novel Gene',
        type: 'parameter',
        value: Math.random(),
        mutable: true,
        expressionLevel: 0.5,
      };
      genome.coreGenes.push(newGene);
      mutations.push({
        id: `mut-${Date.now()}`,
        type: 'insertion',
        target: newGene.id,
        magnitude: 1,
        timestamp: Date.now(),
      });
    }
    
    // Update checksum
    genome.checksum = this.calculateChecksum(genome);
    
    return { genome, mutations };
  }
  
  private mutateGene(gene: Gene): Mutation | null {
    const mutationType: MutationType = 'parameter';
    let magnitude = 0;
    
    if (gene.type === 'parameter' && typeof gene.value === 'number') {
      // Gaussian mutation
      const sigma = 0.1;
      const delta = this.gaussianRandom() * sigma;
      gene.value = Math.max(0, Math.min(1, gene.value + delta));
      magnitude = Math.abs(delta);
    } else if (gene.type === 'switch' && typeof gene.value === 'boolean') {
      gene.value = !gene.value;
      magnitude = 1;
    }
    
    if (magnitude > 0) {
      return {
        id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: mutationType,
        target: gene.id,
        magnitude,
        timestamp: Date.now(),
      };
    }
    
    return null;
  }
  
  private gaussianRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  
  private buildAncestorChain(parents: CognitiveKernel[]): string[] {
    const ancestors = new Set<string>();
    
    for (const parent of parents) {
      ancestors.add(parent.id);
      for (const ancestor of parent.lineage.ancestors.slice(0, 4)) {
        ancestors.add(ancestor);
      }
    }
    
    return Array.from(ancestors).slice(0, 5);
  }
  
  private createInitialFitness(): FitnessScores {
    return {
      overall: 0.5,
      performance: 0.5,
      efficiency: 0.5,
      reliability: 0.5,
      adaptability: 0.5,
      innovation: 0.5,
      evaluations: 0,
      lastEvaluated: 0,
    };
  }
  
  private calculateOverallFitness(fitness: FitnessScores): number {
    return (
      fitness.performance * 0.3 +
      fitness.efficiency * 0.2 +
      fitness.reliability * 0.2 +
      fitness.adaptability * 0.15 +
      fitness.innovation * 0.15
    );
  }
  
  private calculateChecksum(genome: KernelGenome): string {
    const data = JSON.stringify({
      core: genome.coreGenes.map(g => ({ id: g.id, value: g.value })),
      reg: genome.regulatoryGenes.map(g => ({ id: g.id, value: g.value })),
    });
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }
  
  private generateKernelId(): string {
    return `kernel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  
  private findKernel(id: string): CognitiveKernel | null {
    for (const population of this.state.populations) {
      const kernel = population.kernels.find(k => k.id === id);
      if (kernel) return kernel;
    }
    return this.state.archive.find(k => k.id === id) || null;
  }
  
  private emitEvent(type: OntogenesisEventType, data: unknown): void {
    const event: OntogenesisEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    this.eventListeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Ontogenesis event listener error:', error);
      }
    });
  }
}

// Export singleton getter
export const getOntogenesis = (config?: Partial<EvolutionConfig>): OntogenesisService =>
  OntogenesisService.getInstance(config);
