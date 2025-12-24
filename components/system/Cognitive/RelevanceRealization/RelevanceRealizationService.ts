/**
 * Relevance Realization Service
 * 
 * Implements John Vervaeke's Relevance Realization framework.
 * Manages the triad-of-triads (ennead) structure for cognitive processing.
 * 
 * Core Functions:
 * 1. Salience landscape management
 * 2. Frame switching and maintenance
 * 3. Integration of four ways of knowing
 * 4. Opponent processing for tradeoffs
 * 5. Insight generation
 */

import {
  type EnneadState,
  type WaysOfKnowing,
  type OrdersOfUnderstanding,
  type PracticesOfWisdom,
  type SalienceLandscape,
  type SalienceItem,
  type Frame,
  type FrameType,
  type RREvent,
  type RREventType,
  type RREventListener,
  type RRConfig,
  type RRTradeoffs,
  type RelevanceInput,
  type RelevanceOutput,
  type OpponentPair,
  DEFAULT_RR_CONFIG,
} from "./types";

/**
 * Relevance Realization Service Singleton
 */
export class RelevanceRealizationService {
  private static instance: RelevanceRealizationService | null = null;
  
  private state: EnneadState;
  private config: RRConfig;
  private tradeoffs: RRTradeoffs;
  private eventListeners: Map<RREventType, Set<RREventListener>> = new Map();
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  
  private constructor(config: Partial<RRConfig> = {}) {
    this.config = { ...DEFAULT_RR_CONFIG, ...config };
    this.state = this.createInitialState();
    this.tradeoffs = this.createInitialTradeoffs();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<RRConfig>): RelevanceRealizationService {
    if (!RelevanceRealizationService.instance) {
      RelevanceRealizationService.instance = new RelevanceRealizationService(config);
    }
    return RelevanceRealizationService.instance;
  }
  
  /**
   * Start the service
   */
  start(): void {
    if (this.isRunning) return;
    
    console.log('Relevance Realization Service: Starting...');
    this.isRunning = true;
    
    // Start periodic updates
    this.updateInterval = setInterval(
      () => this.update(),
      this.config.updateInterval
    );
    
    console.log('Relevance Realization Service: Running');
  }
  
  /**
   * Stop the service
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Relevance Realization Service: Stopped');
  }
  
  /**
   * Process input through relevance realization
   */
  realize(input: RelevanceInput): RelevanceOutput {
    // Determine salience
    const salience = this.calculateSalience(input);
    
    // Add to salience landscape
    this.addToSalienceLandscape({
      id: `item-${Date.now()}`,
      content: input.content,
      salience,
      source: this.determineKnowingSource(input),
      timestamp: Date.now(),
    });
    
    // Determine appropriate frame
    const frame = this.selectFrame(input, salience);
    
    // Activate relevant knowing
    const knowing = this.activateKnowing(input, frame);
    
    // Determine relevant order
    const order = this.determineOrder(input, frame);
    
    // Identify relevant practice
    const practice = this.identifyPractice(input, frame);
    
    // Generate action suggestions
    const actionSuggestions = this.generateSuggestions(input, frame, knowing);
    
    // Emit event
    this.emitEvent('salience-shift', {
      input,
      salience,
      frame: frame.name,
    });
    
    return {
      salience,
      frame,
      knowing,
      order,
      practice,
      actionSuggestions,
    };
  }
  
  /**
   * Get current state
   */
  getState(): EnneadState {
    return { ...this.state };
  }
  
  /**
   * Get current tradeoffs
   */
  getTradeoffs(): RRTradeoffs {
    return { ...this.tradeoffs };
  }
  
  /**
   * Adjust tradeoff balance
   */
  adjustTradeoff(
    tradeoff: keyof RRTradeoffs,
    direction: 'left' | 'right',
    amount: number = 0.1
  ): void {
    const pair = this.tradeoffs[tradeoff];
    
    if (direction === 'left') {
      pair.exploration = Math.min(1, pair.exploration + amount);
      pair.exploitation = Math.max(0, pair.exploitation - amount);
    } else {
      pair.exploration = Math.max(0, pair.exploration - amount);
      pair.exploitation = Math.min(1, pair.exploitation + amount);
    }
    
    pair.balance = pair.exploration - pair.exploitation;
  }
  
  /**
   * Switch to a specific frame
   */
  switchFrame(frameType: FrameType): void {
    const currentActive = this.state.activeFrames.find(f => f.active);
    
    // Deactivate current
    if (currentActive) {
      currentActive.active = false;
    }
    
    // Find or create target frame
    let targetFrame = this.state.activeFrames.find(f => f.type === frameType);
    
    if (!targetFrame) {
      targetFrame = this.createFrame(frameType);
      this.state.activeFrames.push(targetFrame);
    }
    
    targetFrame.active = true;
    targetFrame.strength = 1.0;
    
    this.emitEvent('frame-change', {
      from: currentActive?.type,
      to: frameType,
    });
  }
  
  /**
   * Add event listener
   */
  addEventListener(type: RREventType, listener: RREventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(type: RREventType, listener: RREventListener): void {
    this.eventListeners.get(type)?.delete(listener);
  }
  
  // Private methods
  
  private createInitialState(): EnneadState {
    return {
      knowing: {
        propositional: { activation: 0.5, confidence: 0.5, focus: [], integration: 0.5 },
        procedural: { activation: 0.5, confidence: 0.5, focus: [], integration: 0.5 },
        perspectival: { activation: 0.5, confidence: 0.5, focus: [], integration: 0.5 },
        participatory: { activation: 0.5, confidence: 0.5, focus: [], integration: 0.5 },
      },
      understanding: {
        nomological: { coherence: 0.5, patterns: [], integration: 0.5 },
        normative: { coherence: 0.5, patterns: [], integration: 0.5 },
        narrative: { coherence: 0.5, patterns: [], integration: 0.5 },
      },
      wisdom: {
        morality: { development: 0.5, cultivation: [], integration: 0.5 },
        meaning: { development: 0.5, cultivation: [], integration: 0.5 },
        mastery: { development: 0.5, cultivation: [], integration: 0.5 },
      },
      integration: 0.5,
      salienceLandscape: {
        foreground: [],
        midground: [],
        background: [],
        focus: null,
      },
      activeFrames: [this.createFrame('integrative')],
    };
  }
  
  private createInitialTradeoffs(): RRTradeoffs {
    const createPair = (): OpponentPair => ({
      exploration: 0.5,
      exploitation: 0.5,
      balance: 0,
    });
    
    return {
      explorationExploitation: createPair(),
      breadthDepth: createPair(),
      stabilityFlexibility: createPair(),
      speedAccuracy: createPair(),
      certaintyOpenness: createPair(),
    };
  }
  
  private createFrame(type: FrameType): Frame {
    const frameNames: Record<FrameType, string> = {
      'problem-solving': 'Problem Solving',
      'creative': 'Creative Exploration',
      'analytical': 'Analytical Reasoning',
      'empathetic': 'Empathetic Understanding',
      'reflective': 'Reflective Contemplation',
      'exploratory': 'Open Exploration',
      'integrative': 'Integrative Synthesis',
    };
    
    return {
      id: `frame-${type}-${Date.now()}`,
      name: frameNames[type],
      type,
      active: type === 'integrative',
      strength: type === 'integrative' ? 1.0 : 0.5,
      constraints: this.getFrameConstraints(type),
    };
  }
  
  private getFrameConstraints(type: FrameType): string[] {
    const constraints: Record<FrameType, string[]> = {
      'problem-solving': ['goal-oriented', 'solution-focused', 'constraint-aware'],
      'creative': ['divergent', 'associative', 'playful'],
      'analytical': ['logical', 'systematic', 'evidence-based'],
      'empathetic': ['perspective-taking', 'emotional-awareness', 'relational'],
      'reflective': ['meta-cognitive', 'self-aware', 'contemplative'],
      'exploratory': ['curious', 'open-ended', 'discovery-oriented'],
      'integrative': ['holistic', 'synthesizing', 'connecting'],
    };
    
    return constraints[type];
  }
  
  private calculateSalience(input: RelevanceInput): number {
    let salience = 0.5;
    
    // Priority boost
    if (input.priority) {
      salience += input.priority * 0.2;
    }
    
    // Source weighting
    const sourceWeights: Record<string, number> = {
      user: 0.3,
      system: 0.2,
      inference: 0.15,
      memory: 0.1,
    };
    salience += sourceWeights[input.source] || 0;
    
    // Context relevance
    if (input.context && this.state.salienceLandscape.focus) {
      if (input.context.includes(this.state.salienceLandscape.focus)) {
        salience += 0.2;
      }
    }
    
    // Novelty bonus
    const isNovel = !this.state.salienceLandscape.foreground.some(
      item => item.content === input.content
    );
    if (isNovel) {
      salience += 0.1;
    }
    
    // Apply exploration/exploitation tradeoff
    const ee = this.tradeoffs.explorationExploitation;
    if (isNovel) {
      salience *= (1 + ee.exploration * 0.2);
    } else {
      salience *= (1 + ee.exploitation * 0.2);
    }
    
    return Math.min(1, Math.max(0, salience));
  }
  
  private addToSalienceLandscape(item: SalienceItem): void {
    const landscape = this.state.salienceLandscape;
    
    // Determine placement based on salience
    if (item.salience >= 0.7) {
      landscape.foreground.push(item);
      landscape.foreground.sort((a, b) => b.salience - a.salience);
      landscape.foreground = landscape.foreground.slice(0, this.config.maxForegroundItems);
      
      // Update focus
      landscape.focus = landscape.foreground[0]?.content || null;
    } else if (item.salience >= 0.4) {
      landscape.midground.push(item);
      landscape.midground = landscape.midground.slice(-20);
    } else {
      landscape.background.push(item);
      landscape.background = landscape.background.slice(-50);
    }
  }
  
  private determineKnowingSource(
    input: RelevanceInput
  ): 'propositional' | 'procedural' | 'perspectival' | 'participatory' {
    // Simple heuristic based on content analysis
    const content = input.content.toLowerCase();
    
    if (content.includes('how to') || content.includes('step') || content.includes('process')) {
      return 'procedural';
    }
    if (content.includes('feel') || content.includes('experience') || content.includes('being')) {
      return 'participatory';
    }
    if (content.includes('view') || content.includes('perspective') || content.includes('frame')) {
      return 'perspectival';
    }
    
    return 'propositional';
  }
  
  private selectFrame(input: RelevanceInput, salience: number): Frame {
    const activeFrame = this.state.activeFrames.find(f => f.active);
    
    if (!activeFrame) {
      return this.createFrame('integrative');
    }
    
    // Check if frame switch is needed
    const content = input.content.toLowerCase();
    let suggestedType: FrameType = activeFrame.type;
    
    if (content.includes('problem') || content.includes('solve') || content.includes('fix')) {
      suggestedType = 'problem-solving';
    } else if (content.includes('create') || content.includes('imagine') || content.includes('new')) {
      suggestedType = 'creative';
    } else if (content.includes('analyze') || content.includes('examine') || content.includes('data')) {
      suggestedType = 'analytical';
    } else if (content.includes('understand') || content.includes('feel') || content.includes('empathy')) {
      suggestedType = 'empathetic';
    } else if (content.includes('reflect') || content.includes('think about') || content.includes('consider')) {
      suggestedType = 'reflective';
    } else if (content.includes('explore') || content.includes('discover') || content.includes('curious')) {
      suggestedType = 'exploratory';
    }
    
    // Switch if salience is high enough and type differs
    if (suggestedType !== activeFrame.type && salience >= this.config.frameSwitchThreshold) {
      this.switchFrame(suggestedType);
      return this.state.activeFrames.find(f => f.active)!;
    }
    
    return activeFrame;
  }
  
  private activateKnowing(input: RelevanceInput, frame: Frame): keyof WaysOfKnowing {
    const source = this.determineKnowingSource(input);
    
    // Boost activation for the relevant knowing
    this.state.knowing[source].activation = Math.min(
      1,
      this.state.knowing[source].activation + 0.1
    );
    
    // Add to focus
    if (!this.state.knowing[source].focus.includes(input.content)) {
      this.state.knowing[source].focus.push(input.content);
      this.state.knowing[source].focus = this.state.knowing[source].focus.slice(-5);
    }
    
    this.emitEvent('knowing-activated', { knowing: source, input });
    
    return source;
  }
  
  private determineOrder(input: RelevanceInput, frame: Frame): keyof OrdersOfUnderstanding {
    const content = input.content.toLowerCase();
    
    if (content.includes('cause') || content.includes('effect') || content.includes('mechanism')) {
      return 'nomological';
    }
    if (content.includes('should') || content.includes('value') || content.includes('important')) {
      return 'normative';
    }
    if (content.includes('story') || content.includes('history') || content.includes('develop')) {
      return 'narrative';
    }
    
    // Default based on frame
    const frameOrderMap: Record<FrameType, keyof OrdersOfUnderstanding> = {
      'problem-solving': 'nomological',
      'creative': 'narrative',
      'analytical': 'nomological',
      'empathetic': 'normative',
      'reflective': 'narrative',
      'exploratory': 'nomological',
      'integrative': 'normative',
    };
    
    return frameOrderMap[frame.type];
  }
  
  private identifyPractice(input: RelevanceInput, frame: Frame): keyof PracticesOfWisdom {
    const content = input.content.toLowerCase();
    
    if (content.includes('right') || content.includes('wrong') || content.includes('ethical')) {
      return 'morality';
    }
    if (content.includes('meaning') || content.includes('purpose') || content.includes('significant')) {
      return 'meaning';
    }
    if (content.includes('skill') || content.includes('improve') || content.includes('master')) {
      return 'mastery';
    }
    
    // Default based on frame
    const framePracticeMap: Record<FrameType, keyof PracticesOfWisdom> = {
      'problem-solving': 'mastery',
      'creative': 'meaning',
      'analytical': 'mastery',
      'empathetic': 'morality',
      'reflective': 'meaning',
      'exploratory': 'mastery',
      'integrative': 'meaning',
    };
    
    return framePracticeMap[frame.type];
  }
  
  private generateSuggestions(
    input: RelevanceInput,
    frame: Frame,
    knowing: keyof WaysOfKnowing
  ): string[] {
    const suggestions: string[] = [];
    
    // Frame-based suggestions
    switch (frame.type) {
      case 'problem-solving':
        suggestions.push('Define the problem clearly');
        suggestions.push('Identify constraints and resources');
        suggestions.push('Generate potential solutions');
        break;
      case 'creative':
        suggestions.push('Explore unconventional connections');
        suggestions.push('Suspend judgment temporarily');
        suggestions.push('Generate multiple alternatives');
        break;
      case 'analytical':
        suggestions.push('Gather relevant data');
        suggestions.push('Identify patterns and relationships');
        suggestions.push('Test hypotheses systematically');
        break;
      case 'empathetic':
        suggestions.push('Consider other perspectives');
        suggestions.push('Acknowledge emotional dimensions');
        suggestions.push('Seek to understand before being understood');
        break;
      case 'reflective':
        suggestions.push('Examine assumptions');
        suggestions.push('Consider long-term implications');
        suggestions.push('Integrate insights from experience');
        break;
      case 'exploratory':
        suggestions.push('Follow curiosity');
        suggestions.push('Ask open-ended questions');
        suggestions.push('Embrace uncertainty');
        break;
      case 'integrative':
        suggestions.push('Synthesize multiple perspectives');
        suggestions.push('Find common patterns');
        suggestions.push('Build coherent understanding');
        break;
    }
    
    return suggestions;
  }
  
  private update(): void {
    // Decay salience
    this.decaySalience();
    
    // Update integration scores
    this.updateIntegration();
    
    // Decay frame strengths
    this.decayFrameStrengths();
    
    // Check for insights
    this.checkForInsights();
  }
  
  private decaySalience(): void {
    const decay = this.config.salienceDecay;
    const landscape = this.state.salienceLandscape;
    
    // Decay and filter
    landscape.foreground = landscape.foreground
      .map(item => ({ ...item, salience: item.salience * decay }))
      .filter(item => item.salience >= 0.5);
    
    landscape.midground = landscape.midground
      .map(item => ({ ...item, salience: item.salience * decay }))
      .filter(item => item.salience >= 0.2);
    
    // Promote from midground if foreground is empty
    if (landscape.foreground.length === 0 && landscape.midground.length > 0) {
      const promoted = landscape.midground.shift()!;
      promoted.salience = 0.7;
      landscape.foreground.push(promoted);
    }
    
    // Update focus
    landscape.focus = landscape.foreground[0]?.content || null;
  }
  
  private updateIntegration(): void {
    // Calculate knowing integration
    const knowingValues = Object.values(this.state.knowing);
    const knowingIntegration = knowingValues.reduce(
      (sum, k) => sum + k.activation * k.confidence,
      0
    ) / knowingValues.length;
    
    // Calculate understanding integration
    const understandingValues = Object.values(this.state.understanding);
    const understandingIntegration = understandingValues.reduce(
      (sum, o) => sum + o.coherence,
      0
    ) / understandingValues.length;
    
    // Calculate wisdom integration
    const wisdomValues = Object.values(this.state.wisdom);
    const wisdomIntegration = wisdomValues.reduce(
      (sum, p) => sum + p.development,
      0
    ) / wisdomValues.length;
    
    // Overall integration
    this.state.integration = (
      knowingIntegration * 0.4 +
      understandingIntegration * 0.3 +
      wisdomIntegration * 0.3
    );
    
    if (this.state.integration >= this.config.integrationThreshold) {
      this.emitEvent('integration-update', {
        integration: this.state.integration,
        knowing: knowingIntegration,
        understanding: understandingIntegration,
        wisdom: wisdomIntegration,
      });
    }
  }
  
  private decayFrameStrengths(): void {
    for (const frame of this.state.activeFrames) {
      if (!frame.active) {
        frame.strength *= 0.95;
      }
    }
    
    // Remove weak frames
    this.state.activeFrames = this.state.activeFrames.filter(
      f => f.active || f.strength > 0.1
    );
  }
  
  private checkForInsights(): void {
    // Check for high integration across all dimensions
    if (this.state.integration >= 0.8) {
      // Generate insight
      const insight = this.generateInsight();
      if (insight) {
        this.emitEvent('insight-generated', { insight });
      }
    }
  }
  
  private generateInsight(): string | null {
    const foreground = this.state.salienceLandscape.foreground;
    
    if (foreground.length < 2) return null;
    
    // Simple insight generation by connecting foreground items
    const items = foreground.slice(0, 3).map(i => i.content);
    
    return `Connection identified between: ${items.join(', ')}`;
  }
  
  private emitEvent(type: RREventType, data: unknown): void {
    const event: RREvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    this.eventListeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('RR event listener error:', error);
      }
    });
  }
}

// Export singleton getter
export const getRelevanceRealization = (
  config?: Partial<RRConfig>
): RelevanceRealizationService => RelevanceRealizationService.getInstance(config);
