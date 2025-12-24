/**
 * Cognitive Context
 * 
 * React context provider for the Daedalus Cognitive System.
 * Provides access to cognitive services throughout the application.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  DaedalusCognitiveSystem,
  getDaedalus,
  type CognitiveSystemState,
  type CognitiveSystemEvent,
} from '../components/system/Cognitive';

/**
 * Cognitive Context Value
 */
interface CognitiveContextValue {
  /** Cognitive system instance */
  system: DaedalusCognitiveSystem;
  
  /** Current system state */
  state: CognitiveSystemState;
  
  /** Is system ready */
  isReady: boolean;
  
  /** Initialize the system */
  initialize: () => Promise<void>;
  
  /** Start the system */
  start: () => Promise<void>;
  
  /** Stop the system */
  stop: () => void;
  
  /** Process input through cognitive system */
  process: (input: string, context?: Record<string, unknown>) => Promise<{
    response: string;
    relevance: unknown;
    emotion: string;
    mode: string;
  }>;
}

/**
 * Create context with undefined default
 */
const CognitiveContext = createContext<CognitiveContextValue | undefined>(undefined);

/**
 * Cognitive Provider Props
 */
interface CognitiveProviderProps {
  children: ReactNode;
  autoStart?: boolean;
}

/**
 * Cognitive Provider Component
 */
export const CognitiveProvider: React.FC<CognitiveProviderProps> = ({
  children,
  autoStart = false,
}) => {
  const [system] = useState(() => getDaedalus());
  const [state, setState] = useState<CognitiveSystemState>(system.getState());
  const [isReady, setIsReady] = useState(false);
  
  // Update state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setState(system.getState());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [system]);
  
  // Listen for system events
  useEffect(() => {
    const handleEvent = (event: CognitiveSystemEvent) => {
      console.log('Cognitive System Event:', event.type, event.data);
      setState(system.getState());
      
      if (event.type === 'system-started') {
        setIsReady(true);
      } else if (event.type === 'system-stopped') {
        setIsReady(false);
      }
    };
    
    system.addEventListener('system-initialized', handleEvent);
    system.addEventListener('system-started', handleEvent);
    system.addEventListener('system-stopped', handleEvent);
    system.addEventListener('service-error', handleEvent);
    
    return () => {
      system.removeEventListener('system-initialized', handleEvent);
      system.removeEventListener('system-started', handleEvent);
      system.removeEventListener('system-stopped', handleEvent);
      system.removeEventListener('service-error', handleEvent);
    };
  }, [system]);
  
  // Auto-start if configured
  useEffect(() => {
    if (autoStart) {
      system.start().catch(console.error);
    }
  }, [autoStart, system]);
  
  const initialize = useCallback(async () => {
    await system.initialize();
    setState(system.getState());
  }, [system]);
  
  const start = useCallback(async () => {
    await system.start();
    setState(system.getState());
  }, [system]);
  
  const stop = useCallback(() => {
    system.stop();
    setState(system.getState());
  }, [system]);
  
  const process = useCallback(async (
    input: string,
    context?: Record<string, unknown>
  ) => {
    return system.process(input, context);
  }, [system]);
  
  const value: CognitiveContextValue = {
    system,
    state,
    isReady,
    initialize,
    start,
    stop,
    process,
  };
  
  return (
    <CognitiveContext.Provider value={value}>
      {children}
    </CognitiveContext.Provider>
  );
};

/**
 * Hook to use cognitive context
 */
export const useCognitive = (): CognitiveContextValue => {
  const context = useContext(CognitiveContext);
  
  if (!context) {
    throw new Error('useCognitive must be used within a CognitiveProvider');
  }
  
  return context;
};

/**
 * Hook to use NPU
 */
export const useNPU = () => {
  const { system, isReady } = useCognitive();
  return { npu: system.getNPU(), isReady };
};

/**
 * Hook to use Entelechy
 */
export const useEntelechy = () => {
  const { system, isReady } = useCognitive();
  return { entelechy: system.getEntelechy(), isReady };
};

/**
 * Hook to use Relevance Realization
 */
export const useRelevanceRealization = () => {
  const { system, isReady } = useCognitive();
  return { relevanceRealization: system.getRelevanceRealization(), isReady };
};

/**
 * Hook to use Autognosis
 */
export const useAutognosis = () => {
  const { system, isReady } = useCognitive();
  return { autognosis: system.getAutognosis(), isReady };
};

/**
 * Hook to use Agent-Neuro
 */
export const useAgentNeuro = () => {
  const { system, isReady } = useCognitive();
  return { agentNeuro: system.getAgentNeuro(), isReady };
};

/**
 * Hook to use Ontogenesis
 */
export const useOntogenesis = () => {
  const { system, isReady } = useCognitive();
  return { ontogenesis: system.getOntogenesis(), isReady };
};

export default CognitiveContext;
