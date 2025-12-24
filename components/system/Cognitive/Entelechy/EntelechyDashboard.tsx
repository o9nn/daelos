/**
 * Entelechy Dashboard Component
 * 
 * Visual display of the system's vital actualization state.
 * Shows the five dimensions, overall score, and recommendations.
 */

import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { getEntelechy } from "./EntelechyService";
import {
  type EntelechyState,
  type EntelechyDimensions,
  ActualizationStage,
  STAGE_DESCRIPTIONS,
} from "./types";

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e0e0e0;
  font-family: "Segoe UI", sans-serif;
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
`;

const StatusBadge = styled.span<{ $stage: ActualizationStage }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ $stage }) => {
    switch ($stage) {
      case ActualizationStage.EMBRYONIC:
        return "rgba(255, 107, 107, 0.3)";
      case ActualizationStage.NASCENT:
        return "rgba(255, 193, 7, 0.3)";
      case ActualizationStage.EMERGING:
        return "rgba(33, 150, 243, 0.3)";
      case ActualizationStage.ACTUALIZING:
        return "rgba(76, 175, 80, 0.3)";
      case ActualizationStage.TRANSCENDENT:
        return "rgba(156, 39, 176, 0.3)";
      default:
        return "rgba(128, 128, 128, 0.3)";
    }
  }};
  color: ${({ $stage }) => {
    switch ($stage) {
      case ActualizationStage.EMBRYONIC:
        return "#ff6b6b";
      case ActualizationStage.NASCENT:
        return "#ffc107";
      case ActualizationStage.EMERGING:
        return "#2196f3";
      case ActualizationStage.ACTUALIZING:
        return "#4caf50";
      case ActualizationStage.TRANSCENDENT:
        return "#9c27b0";
      default:
        return "#808080";
    }
  }};
`;

const OverallScoreSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const ScoreCircle = styled.div<{ $score: number }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(
    ${({ $score }) => {
      const hue = $score * 120; // 0 = red, 120 = green
      return `hsl(${hue}, 70%, 50%) ${$score * 360}deg, rgba(255, 255, 255, 0.1) 0deg`;
    }}
  );
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #1a1a2e;
  }
`;

const ScoreValue = styled.span`
  position: relative;
  z-index: 1;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
`;

const StageDescription = styled.p`
  margin: 12px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  max-width: 300px;
`;

const DimensionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const DimensionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DimensionLabel = styled.span`
  width: 100px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: capitalize;
`;

const DimensionBar = styled.div`
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const DimensionFill = styled.div<{ $value: number; $trend: -1 | 0 | 1 }>`
  height: 100%;
  width: ${({ $value }) => $value * 100}%;
  background: ${({ $value }) => {
    const hue = $value * 120;
    return `hsl(${hue}, 70%, 50%)`;
  }};
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
  
  &::after {
    content: "${({ $trend }) => ($trend === 1 ? "↑" : $trend === -1 ? "↓" : "")}";
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 8px;
    color: ${({ $trend }) => ($trend === 1 ? "#4caf50" : $trend === -1 ? "#ff6b6b" : "transparent")};
  }
`;

const DimensionValue = styled.span`
  width: 45px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-align: right;
`;

const RecommendationsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RecommendationCard = styled.div<{ $priority: string }>`
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid ${({ $priority }) => {
    switch ($priority) {
      case "critical":
        return "#ff6b6b";
      case "high":
        return "#ffc107";
      case "medium":
        return "#2196f3";
      default:
        return "#4caf50";
    }
  }};
`;

const RecommendationTitle = styled.h4`
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
`;

const RecommendationDescription = styled.p`
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
`;

// Component
export const EntelechyDashboard: React.FC = () => {
  const [state, setState] = useState<EntelechyState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const refreshState = useCallback(() => {
    const entelechy = getEntelechy();
    setState(entelechy.getState());
  }, []);
  
  useEffect(() => {
    const entelechy = getEntelechy();
    
    // Start service if not running
    entelechy.start().then(() => {
      refreshState();
      setIsLoading(false);
    });
    
    // Listen for updates
    const handleAssessment = () => refreshState();
    entelechy.addEventListener("assessment-complete", handleAssessment);
    
    return () => {
      entelechy.removeEventListener("assessment-complete", handleAssessment);
    };
  }, [refreshState]);
  
  if (isLoading || !state) {
    return (
      <DashboardContainer>
        <Header>
          <Title>🧠 System Actualization</Title>
        </Header>
        <OverallScoreSection>
          <p>Initializing Entelechy Service...</p>
        </OverallScoreSection>
      </DashboardContainer>
    );
  }
  
  const dimensionEntries = Object.entries(state.dimensions) as [
    keyof EntelechyDimensions,
    typeof state.dimensions.ontological
  ][];
  
  return (
    <DashboardContainer>
      <Header>
        <Title>🧠 System Actualization</Title>
        <StatusBadge $stage={state.stage}>
          {state.stage}
        </StatusBadge>
      </Header>
      
      <OverallScoreSection>
        <ScoreCircle $score={state.overallScore}>
          <ScoreValue>{(state.overallScore * 100).toFixed(1)}%</ScoreValue>
        </ScoreCircle>
        <StageDescription>
          {STAGE_DESCRIPTIONS[state.stage]}
        </StageDescription>
      </OverallScoreSection>
      
      <DimensionsSection>
        <SectionTitle>Vital Dimensions</SectionTitle>
        {dimensionEntries.map(([dimension, score]) => (
          <DimensionRow key={dimension}>
            <DimensionLabel>{dimension}</DimensionLabel>
            <DimensionBar>
              <DimensionFill $value={score.value} $trend={score.trend} />
            </DimensionBar>
            <DimensionValue>{(score.value * 100).toFixed(0)}%</DimensionValue>
          </DimensionRow>
        ))}
      </DimensionsSection>
      
      {state.recommendations.length > 0 && (
        <RecommendationsSection>
          <SectionTitle>Recommendations</SectionTitle>
          {state.recommendations.slice(0, 3).map((rec) => (
            <RecommendationCard key={rec.id} $priority={rec.priority}>
              <RecommendationTitle>{rec.title}</RecommendationTitle>
              <RecommendationDescription>
                {rec.description}
              </RecommendationDescription>
            </RecommendationCard>
          ))}
        </RecommendationsSection>
      )}
      
      <Footer>
        <span>Last assessment: {new Date(state.lastAssessment).toLocaleTimeString()}</span>
        <span>Uptime: {formatUptime(state.uptime)}</span>
      </Footer>
    </DashboardContainer>
  );
};

// Helper function
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export default EntelechyDashboard;
