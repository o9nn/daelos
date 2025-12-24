/**
 * Cognitive Dashboard
 * 
 * A comprehensive dashboard for monitoring and interacting with
 * the Daedalus Cognitive System.
 */

import React, { useState, useEffect } from 'react';
import {
  useCognitive,
  useEntelechy,
  useRelevanceRealization,
  useAutognosis,
  useAgentNeuro,
  useOntogenesis,
} from '../../../contexts/CognitiveContext';

/**
 * Dashboard Styles
 */
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    backgroundColor: '#0a0a0f',
    color: '#e0e0e0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'auto',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #2a2a3a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#ffffff',
    margin: 0,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: (active: boolean) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: active ? '#00ff88' : '#ff4444',
  }),
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    padding: '16px',
  },
  card: {
    backgroundColor: '#12121a',
    borderRadius: '8px',
    border: '1px solid #2a2a3a',
    padding: '16px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
  },
  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #1a1a2a',
  },
  metricLabel: {
    color: '#aaa',
    fontSize: '14px',
  },
  metricValue: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 500,
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#1a1a2a',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '4px',
  },
  progressFill: (value: number, color: string) => ({
    width: `${value * 100}%`,
    height: '100%',
    backgroundColor: color,
    transition: 'width 0.3s ease',
  }),
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  },
  primaryButton: {
    backgroundColor: '#4a9eff',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#2a2a3a',
    color: '#fff',
  },
  input: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a1a2a',
    border: '1px solid #2a2a3a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
    marginBottom: '12px',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '300px',
  },
  chatMessages: {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
    backgroundColor: '#0a0a0f',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  chatMessage: (isUser: boolean) => ({
    padding: '8px 12px',
    marginBottom: '8px',
    borderRadius: '8px',
    backgroundColor: isUser ? '#2a4a6a' : '#2a2a3a',
    maxWidth: '80%',
    marginLeft: isUser ? 'auto' : '0',
  }),
};

/**
 * Cognitive Dashboard Component
 */
export const CognitiveDashboard: React.FC = () => {
  const { state, isReady, start, stop, process } = useCognitive();
  const { entelechy } = useEntelechy();
  const { relevanceRealization } = useRelevanceRealization();
  const { autognosis } = useAutognosis();
  const { agentNeuro } = useAgentNeuro();
  const { ontogenesis } = useOntogenesis();
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [entelechyState, setEntelechyState] = useState<any>(null);
  const [autognosisState, setAutognosisState] = useState<any>(null);
  const [agentNeuroState, setAgentNeuroState] = useState<any>(null);
  const [ontogenesisState, setOntogenesisState] = useState<any>(null);
  
  // Update service states
  useEffect(() => {
    const interval = setInterval(() => {
      if (entelechy) setEntelechyState(entelechy.getState());
      if (autognosis) setAutognosisState(autognosis.getState());
      if (agentNeuro) setAgentNeuroState(agentNeuro.getState());
      if (ontogenesis) setOntogenesisState(ontogenesis.getState());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [entelechy, autognosis, agentNeuro, ontogenesis]);
  
  const handleSend = async () => {
    if (!input.trim() || !isReady) return;
    
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    const userInput = input;
    setInput('');
    
    try {
      const result = await process(userInput);
      setMessages(prev => [...prev, { 
        text: result.response || `[${result.mode}] Processing... (Emotion: ${result.emotion})`,
        isUser: false 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: 'Error processing request',
        isUser: false 
      }]);
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Daedalus Cognitive System</h1>
        <div style={styles.status}>
          <div style={styles.statusDot(state.running)} />
          <span>{state.running ? 'Running' : 'Stopped'}</span>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={() => state.running ? stop() : start()}
          >
            {state.running ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
      
      {/* Dashboard Grid */}
      <div style={styles.grid}>
        {/* System Status */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>System Status</div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Initialized</span>
            <span style={styles.metricValue}>{state.initialized ? 'Yes' : 'No'}</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Uptime</span>
            <span style={styles.metricValue}>
              {Math.floor(state.uptime / 1000)}s
            </span>
          </div>
          {Object.entries(state.services).map(([service, active]) => (
            <div key={service} style={styles.metric}>
              <span style={styles.metricLabel}>{service}</span>
              <span style={{ ...styles.metricValue, color: active ? '#00ff88' : '#ff4444' }}>
                {active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Entelechy */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Entelechy (Self-Actualization)</div>
          {entelechyState ? (
            <>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Stage</span>
                <span style={styles.metricValue}>{entelechyState.stage}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Overall Score</span>
                <span style={styles.metricValue}>
                  {(entelechyState.overallScore * 100).toFixed(1)}%
                </span>
              </div>
              <div style={styles.progressBar}>
                <div style={styles.progressFill(entelechyState.overallScore, '#4a9eff')} />
              </div>
              {Object.entries(entelechyState.dimensions || {}).slice(0, 4).map(([dim, data]: [string, any]) => (
                <div key={dim}>
                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>{dim}</span>
                    <span style={styles.metricValue}>{(data.score * 100).toFixed(0)}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={styles.progressFill(data.score, '#00ff88')} />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={styles.metricLabel}>Not initialized</div>
          )}
        </div>
        
        {/* Autognosis */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Autognosis (Self-Knowledge)</div>
          {autognosisState ? (
            <>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Awareness Level</span>
                <span style={styles.metricValue}>
                  {autognosisState.metaCognitive?.awarenessLevel || 'none'}
                </span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Self-Knowledge Score</span>
                <span style={styles.metricValue}>
                  {(autognosisState.selfKnowledgeScore * 100).toFixed(1)}%
                </span>
              </div>
              <div style={styles.progressBar}>
                <div style={styles.progressFill(autognosisState.selfKnowledgeScore, '#ff88ff')} />
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Introspections</span>
                <span style={styles.metricValue}>
                  {autognosisState.introspectionHistory?.length || 0}
                </span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Insights</span>
                <span style={styles.metricValue}>
                  {autognosisState.metaCognitive?.insights?.length || 0}
                </span>
              </div>
            </>
          ) : (
            <div style={styles.metricLabel}>Not initialized</div>
          )}
        </div>
        
        {/* Agent-Neuro */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Agent-Neuro (Personality)</div>
          {agentNeuroState ? (
            <>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Current Mode</span>
                <span style={styles.metricValue}>{agentNeuroState.currentMode?.name}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Emotion</span>
                <span style={styles.metricValue}>{agentNeuroState.emotional?.currentEmotion}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Development Stage</span>
                <span style={styles.metricValue}>{agentNeuroState.development?.stage}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Interactions</span>
                <span style={styles.metricValue}>
                  {agentNeuroState.interactionSummary?.totalInteractions || 0}
                </span>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div style={styles.metricLabel}>Big Five Traits</div>
                {Object.entries(agentNeuroState.personality?.bigFive || {}).map(([trait, value]: [string, any]) => (
                  <div key={trait}>
                    <div style={{ ...styles.metric, padding: '4px 0' }}>
                      <span style={{ ...styles.metricLabel, fontSize: '12px' }}>{trait}</span>
                      <span style={{ ...styles.metricValue, fontSize: '12px' }}>
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ ...styles.progressBar, height: '4px' }}>
                      <div style={styles.progressFill(value, '#ffaa00')} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={styles.metricLabel}>Not initialized</div>
          )}
        </div>
        
        {/* Ontogenesis */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Ontogenesis (Kernel Evolution)</div>
          {ontogenesisState ? (
            <>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Global Generation</span>
                <span style={styles.metricValue}>{ontogenesisState.globalGeneration}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Total Kernels Created</span>
                <span style={styles.metricValue}>{ontogenesisState.totalKernelsCreated}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Evolution Status</span>
                <span style={{ ...styles.metricValue, color: ontogenesisState.isEvolving ? '#00ff88' : '#888' }}>
                  {ontogenesisState.isEvolving ? 'Evolving' : 'Paused'}
                </span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Emergence Events</span>
                <span style={styles.metricValue}>
                  {ontogenesisState.emergenceEvents?.length || 0}
                </span>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div style={styles.metricLabel}>Populations</div>
                {ontogenesisState.populations?.map((pop: any) => (
                  <div key={pop.id} style={{ ...styles.metric, padding: '4px 0' }}>
                    <span style={{ ...styles.metricLabel, fontSize: '12px' }}>{pop.name}</span>
                    <span style={{ ...styles.metricValue, fontSize: '12px' }}>
                      {pop.kernels?.length || 0} kernels | 
                      Avg: {(pop.statistics?.averageFitness * 100 || 0).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={styles.metricLabel}>Not initialized</div>
          )}
        </div>
        
        {/* Chat Interface */}
        <div style={{ ...styles.card, gridColumn: 'span 2' }}>
          <div style={styles.cardTitle}>Cognitive Interface</div>
          <div style={styles.chatContainer}>
            <div style={styles.chatMessages}>
              {messages.length === 0 ? (
                <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                  Start a conversation with Daedalus...
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} style={styles.chatMessage(msg.isUser)}>
                    {msg.text}
                  </div>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                placeholder={isReady ? "Type a message..." : "System not ready..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={!isReady}
              />
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onClick={handleSend}
                disabled={!isReady}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitiveDashboard;
