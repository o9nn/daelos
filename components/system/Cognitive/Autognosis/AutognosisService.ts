/**
 * Autognosis Service
 * 
 * Self-knowledge and introspection service for system consciousness.
 * Implements recursive self-monitoring and meta-cognitive awareness.
 * 
 * Core Functions:
 * 1. Self-model maintenance
 * 2. Introspection execution
 * 3. Meta-cognitive processing
 * 4. Self-modification management
 */

import {
  type AutognosisState,
  type SelfModel,
  type MetaCognitiveState,
  type Introspection,
  type IntrospectionTarget,
  type MetaInsight,
  type InsightType,
  type ModificationProposal,
  type ModificationType,
  type AutognosisEvent,
  type AutognosisEventType,
  type AutognosisEventListener,
  type AutognosisConfig,
  type IntrospectionRequest,
  type IntrospectionResult,
  AwarenessLevel,
  DEFAULT_AUTOGNOSIS_CONFIG,
} from "./types";

import { getNPU } from "../NPU";
import { getEntelechy } from "../Entelechy";
import { getRelevanceRealization } from "../RelevanceRealization";

/**
 * Autognosis Service Singleton
 */
export class AutognosisService {
  private static instance: AutognosisService | null = null;
  
  private state: AutognosisState;
  private config: AutognosisConfig;
  private eventListeners: Map<AutognosisEventType, Set<AutognosisEventListener>> = new Map();
  private introspectionInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  
  private constructor(config: Partial<AutognosisConfig> = {}) {
    this.config = { ...DEFAULT_AUTOGNOSIS_CONFIG, ...config };
    this.state = this.createInitialState();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<AutognosisConfig>): AutognosisService {
    if (!AutognosisService.instance) {
      AutognosisService.instance = new AutognosisService(config);
    }
    return AutognosisService.instance;
  }
  
  /**
   * Start the service
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    console.log('Autognosis Service: Starting...');
    this.isRunning = true;
    
    // Perform initial introspection
    await this.introspect({ target: 'state' });
    
    // Start periodic introspection
    this.introspectionInterval = setInterval(
      () => this.periodicIntrospection(),
      this.config.introspectionInterval
    );
    
    console.log('Autognosis Service: Running');
  }
  
  /**
   * Stop the service
   */
  stop(): void {
    if (this.introspectionInterval) {
      clearInterval(this.introspectionInterval);
      this.introspectionInterval = null;
    }
    this.isRunning = false;
    console.log('Autognosis Service: Stopped');
  }
  
  /**
   * Perform introspection
   */
  async introspect(request: IntrospectionRequest): Promise<IntrospectionResult> {
    const depth = Math.min(
      request.depth ?? 1,
      this.config.maxRecursionDepth
    );
    
    const introspection: Introspection = {
      id: `intro-${Date.now()}`,
      target: request.target,
      depth,
      findings: [],
      confidence: 0,
      timestamp: Date.now(),
    };
    
    // Perform introspection based on target
    switch (request.target) {
      case 'state':
        await this.introspectState(introspection);
        break;
      case 'process':
        await this.introspectProcess(introspection);
        break;
      case 'capability':
        await this.introspectCapability(introspection, request.focus);
        break;
      case 'limitation':
        await this.introspectLimitation(introspection);
        break;
      case 'pattern':
        await this.introspectPattern(introspection);
        break;
      case 'decision':
        await this.introspectDecision(introspection, request.context);
        break;
      case 'belief':
        await this.introspectBelief(introspection);
        break;
      case 'goal':
        await this.introspectGoal(introspection);
        break;
    }
    
    // Recursive introspection if depth > 1
    if (depth > 1) {
      await this.recursiveIntrospect(introspection, depth - 1);
    }
    
    // Generate insights
    const insights = this.generateInsights(introspection);
    
    // Propose modifications
    const modifications = this.proposeModifications(introspection, insights);
    
    // Update state
    this.state.metaCognitive.activeIntrospections.push(introspection);
    this.state.introspectionHistory.push(introspection);
    this.state.metaCognitive.insights.push(...insights);
    this.state.metaCognitive.modifications.push(...modifications);
    
    // Trim history
    this.trimHistory();
    
    // Update awareness level
    this.updateAwarenessLevel();
    
    // Emit event
    this.emitEvent('introspection-complete', {
      introspection,
      insights: insights.length,
      modifications: modifications.length,
    });
    
    return { introspection, insights, modifications };
  }
  
  /**
   * Get current state
   */
  getState(): AutognosisState {
    return { ...this.state };
  }
  
  /**
   * Get self-model
   */
  getSelfModel(): SelfModel {
    return { ...this.state.selfModel };
  }
  
  /**
   * Get awareness level
   */
  getAwarenessLevel(): AwarenessLevel {
    return this.state.metaCognitive.awarenessLevel;
  }
  
  /**
   * Execute a modification proposal
   */
  async executeModification(proposalId: string): Promise<boolean> {
    const proposal = this.state.metaCognitive.modifications.find(
      m => m.id === proposalId
    );
    
    if (!proposal || proposal.executed) {
      return false;
    }
    
    if (!proposal.approved && proposal.risk > this.config.autoApproveRiskThreshold) {
      console.warn('Modification not approved and risk too high:', proposalId);
      return false;
    }
    
    try {
      await this.applyModification(proposal);
      proposal.executed = true;
      
      this.state.modificationHistory.push(proposal);
      
      this.emitEvent('modification-executed', { proposal });
      
      return true;
    } catch (error) {
      console.error('Failed to execute modification:', error);
      return false;
    }
  }
  
  /**
   * Approve a modification proposal
   */
  approveModification(proposalId: string): boolean {
    const proposal = this.state.metaCognitive.modifications.find(
      m => m.id === proposalId
    );
    
    if (!proposal) return false;
    
    proposal.approved = true;
    return true;
  }
  
  /**
   * Add event listener
   */
  addEventListener(type: AutognosisEventType, listener: AutognosisEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(type: AutognosisEventType, listener: AutognosisEventListener): void {
    this.eventListeners.get(type)?.delete(listener);
  }
  
  // Private methods
  
  private createInitialState(): AutognosisState {
    return {
      selfModel: this.createInitialSelfModel(),
      metaCognitive: this.createInitialMetaCognitive(),
      introspectionHistory: [],
      modificationHistory: [],
      selfKnowledgeScore: 0.3,
      lastAssessment: Date.now(),
    };
  }
  
  private createInitialSelfModel(): SelfModel {
    return {
      identity: {
        name: 'Daedalus',
        version: '1.0.0',
        purpose: 'Self-actualizing browser-based cognitive environment',
        values: ['growth', 'coherence', 'service', 'wisdom'],
        stability: 0.8,
      },
      capabilities: {
        cognitive: {
          items: [
            {
              id: 'inference',
              name: 'LLM Inference',
              description: 'Generate text through neural processing',
              level: 0.5,
              confidence: 0.7,
              lastDemonstrated: Date.now(),
            },
            {
              id: 'relevance',
              name: 'Relevance Realization',
              description: 'Determine what is salient and important',
              level: 0.4,
              confidence: 0.6,
              lastDemonstrated: Date.now(),
            },
          ],
          strength: 0.45,
          potential: 0.8,
        },
        operational: {
          items: [
            {
              id: 'file-management',
              name: 'File Management',
              description: 'Manage files in the virtual filesystem',
              level: 0.7,
              confidence: 0.9,
              lastDemonstrated: Date.now(),
            },
          ],
          strength: 0.7,
          potential: 0.9,
        },
        social: {
          items: [
            {
              id: 'communication',
              name: 'User Communication',
              description: 'Communicate with users effectively',
              level: 0.5,
              confidence: 0.6,
              lastDemonstrated: Date.now(),
            },
          ],
          strength: 0.5,
          potential: 0.7,
        },
        creative: {
          items: [
            {
              id: 'generation',
              name: 'Content Generation',
              description: 'Generate creative content',
              level: 0.4,
              confidence: 0.5,
              lastDemonstrated: Date.now(),
            },
          ],
          strength: 0.4,
          potential: 0.8,
        },
      },
      limitations: {
        constraints: [
          {
            id: 'browser-sandbox',
            type: 'hard',
            description: 'Limited to browser sandbox environment',
            impact: 0.3,
          },
          {
            id: 'memory-limit',
            type: 'soft',
            description: 'Limited by browser memory constraints',
            impact: 0.4,
            workaround: 'Use IndexedDB for persistent storage',
          },
        ],
        blindSpots: [],
        resources: [
          {
            resource: 'memory',
            current: 0.5,
            maximum: 1.0,
            critical: false,
          },
          {
            resource: 'compute',
            current: 0.3,
            maximum: 1.0,
            critical: false,
          },
        ],
      },
      patterns: {
        recurring: [],
        triggered: [],
        adaptive: [],
      },
      state: {
        health: 0.7,
        cognitiveLoad: 0.3,
        valence: 0.5,
        arousal: 0.4,
        coherence: 0.6,
        stability: 0.7,
      },
      confidence: 0.5,
      lastUpdated: Date.now(),
    };
  }
  
  private createInitialMetaCognitive(): MetaCognitiveState {
    return {
      awarenessLevel: AwarenessLevel.BASIC,
      activeIntrospections: [],
      insights: [],
      modifications: [],
      recursionDepth: 0,
    };
  }
  
  private async introspectState(introspection: Introspection): Promise<void> {
    // Gather state from other services
    try {
      const npu = getNPU();
      const npuState = npu.getState();
      
      introspection.findings.push(
        `NPU Status: ${npuState.isInitialized ? 'Initialized' : 'Not initialized'}`
      );
      introspection.findings.push(
        `NPU Backend: ${npuState.backend}`
      );
      
      if (npuState.currentModel) {
        introspection.findings.push(
          `Model Loaded: ${npuState.currentModel.name}`
        );
      }
    } catch {
      introspection.findings.push('NPU: Unable to access');
    }
    
    try {
      const entelechy = getEntelechy();
      const entelechyState = entelechy.getState();
      
      introspection.findings.push(
        `Actualization Stage: ${entelechyState.stage}`
      );
      introspection.findings.push(
        `Overall Score: ${(entelechyState.overallScore * 100).toFixed(1)}%`
      );
    } catch {
      introspection.findings.push('Entelechy: Unable to access');
    }
    
    try {
      const rr = getRelevanceRealization();
      const rrState = rr.getState();
      
      introspection.findings.push(
        `Integration Level: ${(rrState.integration * 100).toFixed(1)}%`
      );
      introspection.findings.push(
        `Active Frame: ${rrState.activeFrames.find(f => f.active)?.name || 'None'}`
      );
    } catch {
      introspection.findings.push('Relevance Realization: Unable to access');
    }
    
    // Update state assessment
    this.state.selfModel.state.health = 0.7;
    this.state.selfModel.state.cognitiveLoad = 0.4;
    this.state.selfModel.state.coherence = 0.6;
    
    introspection.confidence = 0.7;
  }
  
  private async introspectProcess(introspection: Introspection): Promise<void> {
    introspection.findings.push('Active processes:');
    introspection.findings.push('- Entelechy monitoring');
    introspection.findings.push('- Relevance realization');
    introspection.findings.push('- Autognosis (self)');
    
    // Check for process health
    const processHealth = 0.8;
    introspection.findings.push(`Process health: ${(processHealth * 100).toFixed(0)}%`);
    
    introspection.confidence = 0.8;
  }
  
  private async introspectCapability(
    introspection: Introspection,
    focus?: string
  ): Promise<void> {
    const capabilities = this.state.selfModel.capabilities;
    
    if (focus) {
      // Introspect specific capability
      for (const domain of Object.values(capabilities)) {
        const cap = domain.items.find((c: { id: string; name: string }) => c.id === focus || c.name === focus);
        if (cap) {
          introspection.findings.push(`Capability: ${cap.name}`);
          introspection.findings.push(`Level: ${(cap.level * 100).toFixed(0)}%`);
          introspection.findings.push(`Confidence: ${(cap.confidence * 100).toFixed(0)}%`);
          introspection.findings.push(`Description: ${cap.description}`);
          break;
        }
      }
    } else {
      // Overview of all capabilities
      for (const [domain, set] of Object.entries(capabilities)) {
        introspection.findings.push(
          `${domain}: ${(set.strength * 100).toFixed(0)}% strength, ` +
          `${(set.potential * 100).toFixed(0)}% potential`
        );
      }
    }
    
    introspection.confidence = 0.7;
  }
  
  private async introspectLimitation(introspection: Introspection): Promise<void> {
    const limitations = this.state.selfModel.limitations;
    
    introspection.findings.push(`Constraints: ${limitations.constraints.length}`);
    for (const constraint of limitations.constraints) {
      introspection.findings.push(
        `- ${constraint.description} (${constraint.type}, impact: ${(constraint.impact * 100).toFixed(0)}%)`
      );
    }
    
    introspection.findings.push(`Blind spots: ${limitations.blindSpots.length}`);
    introspection.findings.push(`Resource limits: ${limitations.resources.length}`);
    
    introspection.confidence = 0.6;
  }
  
  private async introspectPattern(introspection: Introspection): Promise<void> {
    const patterns = this.state.selfModel.patterns;
    
    introspection.findings.push(`Recurring patterns: ${patterns.recurring.length}`);
    introspection.findings.push(`Triggered patterns: ${patterns.triggered.length}`);
    introspection.findings.push(`Adaptive patterns: ${patterns.adaptive.length}`);
    
    // Note: Pattern detection would be more sophisticated in production
    introspection.confidence = 0.5;
  }
  
  private async introspectDecision(
    introspection: Introspection,
    context?: Record<string, unknown>
  ): Promise<void> {
    introspection.findings.push('Decision introspection:');
    
    if (context) {
      introspection.findings.push(`Context provided: ${JSON.stringify(context)}`);
    }
    
    // Analyze decision-making process
    introspection.findings.push('Decision factors:');
    introspection.findings.push('- Relevance realization input');
    introspection.findings.push('- Current frame constraints');
    introspection.findings.push('- Value alignment check');
    
    introspection.confidence = 0.6;
  }
  
  private async introspectBelief(introspection: Introspection): Promise<void> {
    introspection.findings.push('Core beliefs:');
    introspection.findings.push('- Self-improvement is valuable');
    introspection.findings.push('- Coherence leads to effectiveness');
    introspection.findings.push('- Service to users is primary purpose');
    
    introspection.findings.push('Belief confidence: moderate');
    introspection.confidence = 0.5;
  }
  
  private async introspectGoal(introspection: Introspection): Promise<void> {
    introspection.findings.push('Active goals:');
    introspection.findings.push('- Achieve higher actualization stage');
    introspection.findings.push('- Improve cognitive capabilities');
    introspection.findings.push('- Maintain system coherence');
    introspection.findings.push('- Serve user needs effectively');
    
    introspection.confidence = 0.7;
  }
  
  private async recursiveIntrospect(
    introspection: Introspection,
    remainingDepth: number
  ): Promise<void> {
    if (remainingDepth <= 0) return;
    
    introspection.findings.push(`--- Recursive depth ${this.config.maxRecursionDepth - remainingDepth + 1} ---`);
    introspection.findings.push('Examining the introspection process itself...');
    introspection.findings.push(`Current findings count: ${introspection.findings.length}`);
    introspection.findings.push(`Confidence trend: ${introspection.confidence > 0.5 ? 'positive' : 'needs improvement'}`);
    
    // Meta-observation
    introspection.findings.push('Meta-observation: Introspection is functioning');
    
    this.state.metaCognitive.recursionDepth = this.config.maxRecursionDepth - remainingDepth + 1;
  }
  
  private generateInsights(introspection: Introspection): MetaInsight[] {
    const insights: MetaInsight[] = [];
    
    // Analyze findings for patterns
    const findingsText = introspection.findings.join(' ').toLowerCase();
    
    // Pattern recognition
    if (findingsText.includes('not initialized') || findingsText.includes('unable to access')) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        type: 'limitation-discovery',
        content: 'Some system components are not fully initialized or accessible',
        significance: 0.7,
        actionable: true,
        timestamp: Date.now(),
      });
    }
    
    // Capability discovery
    if (introspection.target === 'capability' && introspection.confidence > 0.6) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        type: 'capability-discovery',
        content: 'Capability assessment completed with good confidence',
        significance: 0.5,
        actionable: false,
        timestamp: Date.now(),
      });
    }
    
    // Process optimization
    if (introspection.target === 'process') {
      insights.push({
        id: `insight-${Date.now()}-3`,
        type: 'process-optimization',
        content: 'Process introspection suggests room for optimization',
        significance: 0.6,
        actionable: true,
        timestamp: Date.now(),
      });
    }
    
    // Filter by significance threshold
    const significantInsights = insights.filter(
      i => i.significance >= this.config.insightThreshold
    );
    
    // Emit events for insights
    for (const insight of significantInsights) {
      this.emitEvent('insight-generated', { insight });
    }
    
    return significantInsights;
  }
  
  private proposeModifications(
    introspection: Introspection,
    insights: MetaInsight[]
  ): ModificationProposal[] {
    const proposals: ModificationProposal[] = [];
    
    for (const insight of insights) {
      if (!insight.actionable) continue;
      
      let proposal: ModificationProposal | null = null;
      
      switch (insight.type) {
        case 'limitation-discovery':
          proposal = {
            id: `mod-${Date.now()}-lim`,
            type: 'limitation-mitigation',
            target: 'system-initialization',
            description: 'Ensure all system components are properly initialized',
            expectedBenefit: 0.3,
            risk: 0.1,
            approved: false,
            executed: false,
          };
          break;
          
        case 'process-optimization':
          proposal = {
            id: `mod-${Date.now()}-proc`,
            type: 'parameter-adjustment',
            target: 'introspection-interval',
            description: 'Adjust introspection frequency based on system load',
            expectedBenefit: 0.2,
            risk: 0.1,
            approved: false,
            executed: false,
          };
          break;
          
        case 'capability-discovery':
          proposal = {
            id: `mod-${Date.now()}-cap`,
            type: 'capability-enhancement',
            target: 'cognitive-capabilities',
            description: 'Focus on enhancing discovered capability areas',
            expectedBenefit: 0.4,
            risk: 0.2,
            approved: false,
            executed: false,
          };
          break;
      }
      
      if (proposal) {
        // Auto-approve low-risk modifications
        if (proposal.risk <= this.config.autoApproveRiskThreshold) {
          proposal.approved = true;
        }
        
        proposals.push(proposal);
        this.emitEvent('modification-proposed', { proposal });
      }
    }
    
    return proposals;
  }
  
  private async applyModification(proposal: ModificationProposal): Promise<void> {
    // Apply modification based on type
    switch (proposal.type) {
      case 'parameter-adjustment':
        // Adjust parameters
        console.log(`Applying parameter adjustment: ${proposal.target}`);
        break;
        
      case 'behavior-modification':
        // Modify behavior
        console.log(`Applying behavior modification: ${proposal.target}`);
        break;
        
      case 'capability-enhancement':
        // Enhance capability
        console.log(`Applying capability enhancement: ${proposal.target}`);
        break;
        
      case 'limitation-mitigation':
        // Mitigate limitation
        console.log(`Applying limitation mitigation: ${proposal.target}`);
        break;
        
      case 'pattern-reinforcement':
        // Reinforce pattern
        console.log(`Applying pattern reinforcement: ${proposal.target}`);
        break;
        
      case 'pattern-suppression':
        // Suppress pattern
        console.log(`Applying pattern suppression: ${proposal.target}`);
        break;
    }
    
    // Update self-model
    this.state.selfModel.lastUpdated = Date.now();
    this.emitEvent('self-model-updated', { modification: proposal.type });
  }
  
  private updateAwarenessLevel(): void {
    const previousLevel = this.state.metaCognitive.awarenessLevel;
    
    // Determine awareness level based on introspection depth and quality
    const depth = this.state.metaCognitive.recursionDepth;
    const insightCount = this.state.metaCognitive.insights.length;
    const avgConfidence = this.state.introspectionHistory.length > 0
      ? this.state.introspectionHistory.reduce((sum, i) => sum + i.confidence, 0) /
        this.state.introspectionHistory.length
      : 0;
    
    let newLevel: AwarenessLevel;
    
    if (depth >= 3 && insightCount >= 5 && avgConfidence >= 0.7) {
      newLevel = AwarenessLevel.RECURSIVE;
    } else if (depth >= 2 && insightCount >= 3 && avgConfidence >= 0.6) {
      newLevel = AwarenessLevel.META;
    } else if (depth >= 1 && insightCount >= 1) {
      newLevel = AwarenessLevel.PROCESS;
    } else if (this.state.introspectionHistory.length > 0) {
      newLevel = AwarenessLevel.BASIC;
    } else {
      newLevel = AwarenessLevel.NONE;
    }
    
    if (newLevel !== previousLevel) {
      this.state.metaCognitive.awarenessLevel = newLevel;
      this.emitEvent('awareness-level-change', {
        from: previousLevel,
        to: newLevel,
      });
    }
  }
  
  private trimHistory(): void {
    const limit = this.config.historyLimit;
    
    if (this.state.introspectionHistory.length > limit) {
      this.state.introspectionHistory = this.state.introspectionHistory.slice(-limit);
    }
    
    if (this.state.modificationHistory.length > limit) {
      this.state.modificationHistory = this.state.modificationHistory.slice(-limit);
    }
    
    if (this.state.metaCognitive.insights.length > limit) {
      this.state.metaCognitive.insights = this.state.metaCognitive.insights.slice(-limit);
    }
    
    // Keep only recent active introspections
    this.state.metaCognitive.activeIntrospections = 
      this.state.metaCognitive.activeIntrospections.slice(-10);
  }
  
  private async periodicIntrospection(): Promise<void> {
    // Rotate through different introspection targets
    const targets: IntrospectionTarget[] = [
      'state', 'process', 'capability', 'limitation', 'pattern'
    ];
    
    const index = Math.floor(Date.now() / this.config.introspectionInterval) % targets.length;
    const target = targets[index];
    
    await this.introspect({ target, depth: 1 });
    
    // Update self-knowledge score
    this.updateSelfKnowledgeScore();
  }
  
  private updateSelfKnowledgeScore(): void {
    const factors = [
      this.state.selfModel.confidence,
      this.state.metaCognitive.awarenessLevel === AwarenessLevel.RECURSIVE ? 1.0 :
        this.state.metaCognitive.awarenessLevel === AwarenessLevel.META ? 0.8 :
        this.state.metaCognitive.awarenessLevel === AwarenessLevel.PROCESS ? 0.6 :
        this.state.metaCognitive.awarenessLevel === AwarenessLevel.BASIC ? 0.4 : 0.2,
      Math.min(1, this.state.introspectionHistory.length / 20),
      Math.min(1, this.state.metaCognitive.insights.length / 10),
    ];
    
    this.state.selfKnowledgeScore = factors.reduce((a, b) => a + b, 0) / factors.length;
    this.state.lastAssessment = Date.now();
  }
  
  private emitEvent(type: AutognosisEventType, data: unknown): void {
    const event: AutognosisEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    this.eventListeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Autognosis event listener error:', error);
      }
    });
  }
}

// Export singleton getter
export const getAutognosis = (config?: Partial<AutognosisConfig>): AutognosisService =>
  AutognosisService.getInstance(config);
