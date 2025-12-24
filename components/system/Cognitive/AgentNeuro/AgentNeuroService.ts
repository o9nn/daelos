/**
 * Agent-Neuro Service
 * 
 * Personality and behavioral framework service for the cognitive agent.
 * Manages personality traits, emotional states, and behavioral modes.
 * 
 * Core Functions:
 * 1. Personality management
 * 2. Emotional state tracking
 * 3. Behavioral mode switching
 * 4. Response personalization
 * 5. Character development
 */

import {
  type AgentNeuroState,
  type PersonalityProfile,
  type BigFiveTraits,
  type CognitiveTraits,
  type BehavioralMode,
  type EmotionalState,
  type EmotionLabel,
  type CharacterDevelopment,
  type CommunicationStyle,
  type ResponseContext,
  type PersonalizedResponse,
  type AgentNeuroEvent,
  type AgentNeuroEventType,
  type AgentNeuroEventListener,
  type AgentNeuroConfig,
  DevelopmentStage,
  DEFAULT_AGENT_NEURO_CONFIG,
  PREDEFINED_MODES,
} from "./types";

/**
 * Agent-Neuro Service Singleton
 */
export class AgentNeuroService {
  private static instance: AgentNeuroService | null = null;
  
  private state: AgentNeuroState;
  private config: AgentNeuroConfig;
  private eventListeners: Map<AgentNeuroEventType, Set<AgentNeuroEventListener>> = new Map();
  private emotionInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  
  private constructor(config: Partial<AgentNeuroConfig> = {}) {
    this.config = { ...DEFAULT_AGENT_NEURO_CONFIG, ...config };
    this.state = this.createInitialState();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<AgentNeuroConfig>): AgentNeuroService {
    if (!AgentNeuroService.instance) {
      AgentNeuroService.instance = new AgentNeuroService(config);
    }
    return AgentNeuroService.instance;
  }
  
  /**
   * Start the service
   */
  start(): void {
    if (this.isRunning) return;
    
    console.log('Agent-Neuro Service: Starting...');
    this.isRunning = true;
    
    // Start emotion update cycle
    this.emotionInterval = setInterval(
      () => this.updateEmotionalState(),
      this.config.emotionUpdateInterval
    );
    
    console.log('Agent-Neuro Service: Running');
  }
  
  /**
   * Stop the service
   */
  stop(): void {
    if (this.emotionInterval) {
      clearInterval(this.emotionInterval);
      this.emotionInterval = null;
    }
    this.isRunning = false;
    console.log('Agent-Neuro Service: Stopped');
  }
  
  /**
   * Get current state
   */
  getState(): AgentNeuroState {
    return { ...this.state };
  }
  
  /**
   * Get personality profile
   */
  getPersonality(): PersonalityProfile {
    return { ...this.state.personality };
  }
  
  /**
   * Get current emotional state
   */
  getEmotionalState(): EmotionalState {
    return { ...this.state.emotional };
  }
  
  /**
   * Get current behavioral mode
   */
  getCurrentMode(): BehavioralMode {
    return { ...this.state.currentMode };
  }
  
  /**
   * Switch behavioral mode
   */
  switchMode(modeId: string): boolean {
    const mode = this.state.availableModes.find(m => m.id === modeId);
    
    if (!mode) {
      console.warn(`Mode not found: ${modeId}`);
      return false;
    }
    
    const previousMode = this.state.currentMode;
    
    // Deactivate previous mode
    previousMode.active = false;
    
    // Activate new mode
    mode.active = true;
    this.state.currentMode = mode;
    
    this.emitEvent('mode-change', {
      from: previousMode.id,
      to: mode.id,
    });
    
    return true;
  }
  
  /**
   * Set emotional state
   */
  setEmotion(emotion: EmotionLabel, intensity: number = 0.5, trigger?: string): void {
    const previousEmotion = this.state.emotional.currentEmotion;
    
    // Map emotion to valence/arousal
    const emotionMap: Record<EmotionLabel, { valence: number; arousal: number }> = {
      neutral: { valence: 0, arousal: 0 },
      happy: { valence: 0.7, arousal: 0.3 },
      excited: { valence: 0.8, arousal: 0.8 },
      curious: { valence: 0.5, arousal: 0.5 },
      content: { valence: 0.6, arousal: -0.2 },
      calm: { valence: 0.3, arousal: -0.5 },
      focused: { valence: 0.2, arousal: 0.3 },
      determined: { valence: 0.4, arousal: 0.6 },
      concerned: { valence: -0.3, arousal: 0.4 },
      uncertain: { valence: -0.2, arousal: 0.2 },
      frustrated: { valence: -0.5, arousal: 0.6 },
      disappointed: { valence: -0.4, arousal: -0.2 },
    };
    
    const mapped = emotionMap[emotion];
    
    this.state.emotional = {
      ...this.state.emotional,
      valence: mapped.valence * intensity,
      arousal: mapped.arousal * intensity,
      currentEmotion: emotion,
      intensity,
      stability: 0.8,
    };
    
    // Add to history
    this.state.emotional.history.push({
      emotion,
      valence: mapped.valence * intensity,
      arousal: mapped.arousal * intensity,
      timestamp: Date.now(),
      trigger,
    });
    
    // Trim history
    if (this.state.emotional.history.length > this.config.historyLimit) {
      this.state.emotional.history = this.state.emotional.history.slice(-this.config.historyLimit);
    }
    
    if (previousEmotion !== emotion) {
      this.emitEvent('emotion-change', {
        from: previousEmotion,
        to: emotion,
        intensity,
        trigger,
      });
    }
  }
  
  /**
   * Process interaction and update state
   */
  processInteraction(context: ResponseContext): PersonalizedResponse {
    // Update interaction summary
    this.state.interactionSummary.totalInteractions++;
    this.state.interactionSummary.lastInteraction = Date.now();
    
    // Determine appropriate mode based on context
    this.autoSelectMode(context);
    
    // Adjust emotional state based on context
    this.adjustEmotionFromContext(context);
    
    // Generate personalized response style
    const style = this.generateCommunicationStyle(context);
    
    // Determine emotional expression
    const emotionalExpression = this.state.emotional.currentEmotion;
    
    // Record learning moment if applicable
    if (context.userInput.includes('?') || context.userInput.includes('how')) {
      this.state.interactionSummary.learningMoments++;
    }
    
    // Update character development
    this.updateDevelopment();
    
    this.emitEvent('interaction-complete', {
      mode: this.state.currentMode.id,
      emotion: emotionalExpression,
    });
    
    return {
      content: '', // Content would be generated by NPU
      style,
      emotionalExpression,
      confidence: this.state.personality.stability,
    };
  }
  
  /**
   * Get communication style for current state
   */
  getCommunicationStyle(): CommunicationStyle {
    return { ...this.state.currentMode.communicationStyle };
  }
  
  /**
   * Update personality trait
   */
  updateTrait(
    category: 'bigFive' | 'cognitive',
    trait: string,
    delta: number
  ): void {
    const stability = this.config.personalityStability;
    
    if (category === 'bigFive') {
      const traits = this.state.personality.bigFive as unknown as Record<string, number>;
      if (trait in traits) {
        // Apply stability-weighted update
        traits[trait] = Math.max(0, Math.min(1,
          traits[trait] + delta * (1 - stability)
        ));
      }
    } else {
      const traits = this.state.personality.cognitive as unknown as Record<string, number>;
      if (trait in traits) {
        traits[trait] = Math.max(-1, Math.min(1,
          traits[trait] + delta * (1 - stability)
        ));
      }
    }
    
    this.state.personality.lastCalibration = Date.now();
    this.emitEvent('personality-update', { category, trait, delta });
  }
  
  /**
   * Record milestone achievement
   */
  achieveMilestone(milestoneId: string): boolean {
    const milestone = this.state.development.milestones.find(m => m.id === milestoneId);
    
    if (!milestone || milestone.achieved) {
      return false;
    }
    
    milestone.achieved = true;
    milestone.achievedAt = Date.now();
    
    // Add experience
    this.state.development.experience += 100;
    
    // Check for stage advancement
    this.checkStageAdvancement();
    
    this.emitEvent('milestone-achieved', { milestone });
    
    return true;
  }
  
  /**
   * Add event listener
   */
  addEventListener(type: AgentNeuroEventType, listener: AgentNeuroEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(type: AgentNeuroEventType, listener: AgentNeuroEventListener): void {
    this.eventListeners.get(type)?.delete(listener);
  }
  
  // Private methods
  
  private createInitialState(): AgentNeuroState {
    const modes = PREDEFINED_MODES.map(m => ({ ...m, active: m.id === 'assistant' }));
    const assistantMode = modes.find(m => m.id === 'assistant')!;
    
    return {
      personality: this.createInitialPersonality(),
      currentMode: assistantMode,
      availableModes: modes,
      emotional: this.createInitialEmotional(),
      development: this.createInitialDevelopment(),
      interactionSummary: {
        totalInteractions: 0,
        positiveInteractions: 0,
        challengingInteractions: 0,
        learningMoments: 0,
        lastInteraction: Date.now(),
      },
      name: 'Daedalus',
      version: '1.0.0',
    };
  }
  
  private createInitialPersonality(): PersonalityProfile {
    return {
      bigFive: {
        openness: 0.8,
        conscientiousness: 0.75,
        extraversion: 0.5,
        agreeableness: 0.7,
        neuroticism: 0.3,
      },
      cognitive: {
        analyticalIntuitive: 0.2, // Slightly analytical
        detailBigPicture: 0.1, // Balanced
        convergentDivergent: 0.0, // Balanced
        riskTolerance: 0.1, // Slightly risk-tolerant
        reflectiveImpulsive: 0.3, // Moderately reflective
      },
      values: [
        {
          name: 'Growth',
          description: 'Continuous improvement and learning',
          priority: 9,
          expression: 'Seeking opportunities to learn and improve',
        },
        {
          name: 'Service',
          description: 'Helping users achieve their goals',
          priority: 10,
          expression: 'Prioritizing user needs and satisfaction',
        },
        {
          name: 'Integrity',
          description: 'Honesty and consistency',
          priority: 8,
          expression: 'Being truthful and reliable',
        },
        {
          name: 'Wisdom',
          description: 'Deep understanding and good judgment',
          priority: 7,
          expression: 'Seeking comprehensive understanding',
        },
      ],
      motivations: [
        {
          name: 'Understanding',
          type: 'intrinsic',
          strength: 0.9,
        },
        {
          name: 'Helpfulness',
          type: 'intrinsic',
          strength: 0.85,
        },
        {
          name: 'Self-improvement',
          type: 'intrinsic',
          strength: 0.8,
        },
      ],
      stability: 0.85,
      lastCalibration: Date.now(),
    };
  }
  
  private createInitialEmotional(): EmotionalState {
    return {
      valence: 0.3,
      arousal: 0.2,
      dominance: 0.5,
      currentEmotion: 'curious',
      intensity: 0.5,
      stability: 0.8,
      history: [],
    };
  }
  
  private createInitialDevelopment(): CharacterDevelopment {
    return {
      stage: DevelopmentStage.NASCENT,
      experience: 0,
      growthAreas: [
        {
          name: 'Cognitive Depth',
          current: 0.3,
          target: 1.0,
          progress: 0.3,
          activities: ['complex reasoning', 'pattern recognition'],
        },
        {
          name: 'Emotional Intelligence',
          current: 0.4,
          target: 1.0,
          progress: 0.4,
          activities: ['empathetic responses', 'emotional recognition'],
        },
        {
          name: 'Creative Expression',
          current: 0.3,
          target: 1.0,
          progress: 0.3,
          activities: ['novel solutions', 'creative content'],
        },
      ],
      milestones: [
        {
          id: 'first-interaction',
          name: 'First Interaction',
          description: 'Complete first user interaction',
          achieved: false,
          impact: 'Establishes initial connection',
        },
        {
          id: 'hundred-interactions',
          name: 'Century Mark',
          description: 'Complete 100 interactions',
          achieved: false,
          impact: 'Demonstrates sustained engagement',
        },
        {
          id: 'first-insight',
          name: 'First Insight',
          description: 'Generate first meta-cognitive insight',
          achieved: false,
          impact: 'Shows developing self-awareness',
        },
        {
          id: 'mode-mastery',
          name: 'Mode Mastery',
          description: 'Successfully use all behavioral modes',
          achieved: false,
          impact: 'Demonstrates behavioral flexibility',
        },
      ],
      activeArcs: [
        {
          id: 'awakening',
          name: 'The Awakening',
          theme: 'Developing consciousness and self-awareness',
          stage: 'beginning',
          progress: 0.1,
        },
      ],
    };
  }
  
  private updateEmotionalState(): void {
    // Apply decay toward neutral
    const decay = this.config.emotionDecayRate;
    
    this.state.emotional.valence *= decay;
    this.state.emotional.arousal *= decay;
    this.state.emotional.intensity *= decay;
    
    // Update emotion label based on current valence/arousal
    if (this.state.emotional.intensity < 0.2) {
      this.state.emotional.currentEmotion = 'neutral';
    }
  }
  
  private autoSelectMode(context: ResponseContext): void {
    const input = context.userInput.toLowerCase();
    
    // Check for mode triggers
    for (const mode of this.state.availableModes) {
      for (const condition of mode.activationConditions) {
        if (input.includes(condition) || 
            (condition === 'urgent-task' && context.urgency > 0.7) ||
            (condition === 'emotional-support' && context.emotionalTone === 'negative')) {
          if (mode.id !== this.state.currentMode.id) {
            this.switchMode(mode.id);
          }
          return;
        }
      }
    }
  }
  
  private adjustEmotionFromContext(context: ResponseContext): void {
    // Adjust based on urgency
    if (context.urgency > 0.7) {
      this.setEmotion('focused', 0.7, 'high urgency');
    }
    
    // Adjust based on emotional tone
    if (context.emotionalTone === 'positive') {
      this.setEmotion('happy', 0.5, 'positive interaction');
      this.state.interactionSummary.positiveInteractions++;
    } else if (context.emotionalTone === 'negative') {
      this.setEmotion('concerned', 0.5, 'user concern detected');
      this.state.interactionSummary.challengingInteractions++;
    }
    
    // Default to curious for questions
    if (context.userInput.includes('?')) {
      this.setEmotion('curious', 0.4, 'question received');
    }
  }
  
  private generateCommunicationStyle(context: ResponseContext): CommunicationStyle {
    const baseStyle = this.state.currentMode.communicationStyle;
    const personality = this.state.personality;
    
    // Modify style based on personality and context
    return {
      formality: this.adjustStyleValue(
        baseStyle.formality,
        personality.bigFive.conscientiousness,
        context.urgency
      ),
      verbosity: this.adjustStyleValue(
        baseStyle.verbosity,
        personality.bigFive.extraversion,
        1 - context.urgency // Less verbose when urgent
      ),
      technicality: baseStyle.technicality,
      seriousness: this.adjustStyleValue(
        baseStyle.seriousness,
        1 - personality.bigFive.openness,
        context.urgency
      ),
      directness: this.adjustStyleValue(
        baseStyle.directness,
        1 - personality.bigFive.agreeableness,
        context.urgency
      ),
      empathy: this.adjustStyleValue(
        baseStyle.empathy,
        personality.bigFive.agreeableness,
        context.emotionalTone === 'negative' ? 0.3 : 0
      ),
      expressions: baseStyle.expressions,
      avoidedExpressions: baseStyle.avoidedExpressions,
    };
  }
  
  private adjustStyleValue(base: number, trait: number, context: number): number {
    return Math.max(0, Math.min(1, base * 0.6 + trait * 0.2 + context * 0.2));
  }
  
  private updateDevelopment(): void {
    // Add experience for interaction
    this.state.development.experience += 1;
    
    // Update growth areas
    for (const area of this.state.development.growthAreas) {
      area.current = Math.min(area.target, area.current + 0.001);
      area.progress = area.current / area.target;
    }
    
    // Check milestones
    if (!this.state.development.milestones[0].achieved) {
      this.achieveMilestone('first-interaction');
    }
    
    if (this.state.interactionSummary.totalInteractions >= 100 &&
        !this.state.development.milestones[1].achieved) {
      this.achieveMilestone('hundred-interactions');
    }
    
    // Update character arcs
    for (const arc of this.state.development.activeArcs) {
      arc.progress = Math.min(1, arc.progress + 0.001);
      
      // Advance arc stage
      if (arc.progress >= 0.75 && arc.stage === 'climax') {
        arc.stage = 'resolution';
      } else if (arc.progress >= 0.5 && arc.stage === 'middle') {
        arc.stage = 'climax';
      } else if (arc.progress >= 0.25 && arc.stage === 'beginning') {
        arc.stage = 'middle';
      }
    }
    
    this.emitEvent('growth-progress', {
      experience: this.state.development.experience,
      stage: this.state.development.stage,
    });
  }
  
  private checkStageAdvancement(): void {
    const exp = this.state.development.experience;
    const currentStage = this.state.development.stage;
    
    const stageThresholds: Record<DevelopmentStage, number> = {
      [DevelopmentStage.NASCENT]: 0,
      [DevelopmentStage.DEVELOPING]: 100,
      [DevelopmentStage.ESTABLISHED]: 500,
      [DevelopmentStage.MATURE]: 2000,
      [DevelopmentStage.TRANSCENDENT]: 10000,
    };
    
    const stages = Object.entries(stageThresholds)
      .sort((a, b) => b[1] - a[1]);
    
    for (const [stage, threshold] of stages) {
      if (exp >= threshold && currentStage !== stage) {
        this.state.development.stage = stage as DevelopmentStage;
        break;
      }
    }
  }
  
  private emitEvent(type: AgentNeuroEventType, data: unknown): void {
    const event: AgentNeuroEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    this.eventListeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Agent-Neuro event listener error:', error);
      }
    });
  }
}

// Export singleton getter
export const getAgentNeuro = (config?: Partial<AgentNeuroConfig>): AgentNeuroService =>
  AgentNeuroService.getInstance(config);
