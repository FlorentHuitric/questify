// src/components/CombatTimeline.tsx
import React from 'react';
import '../styles/CombatTimeline.css';

interface CombatTimelineProps {
  turnOrder: ('player' | 'enemy')[];
  currentTurn: number;
  playerName: string;
  enemyName: string;
}

const CombatTimeline: React.FC<CombatTimelineProps> = ({ 
  turnOrder, 
  currentTurn, 
  playerName = "Joueur", 
  enemyName 
}) => {
  // Afficher les 10 prochains tours
  const upcomingTurns = turnOrder.slice(currentTurn, currentTurn + 10);
  
  return (
    <div className="combat-timeline">
      <h3>🕐 Timeline des Tours</h3>
      <div className="timeline-container">
        {upcomingTurns.map((actor, index) => (
          <div 
            key={index} 
            className={`timeline-turn ${actor} ${index === 0 ? 'current' : ''}`}
          >
            <div className="turn-indicator">
              <div className="turn-icon">
                {actor === 'player' ? '🗡️' : '👹'}
              </div>
              <div className="turn-name">
                {actor === 'player' ? playerName : enemyName}
              </div>
            </div>
            {index === 0 && (
              <div className="current-turn-highlight">
                <span>Tour actuel</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="timeline-explanation">
        <div className="legend">
          <div className="legend-item">
            <span className="legend-icon player">🗡️</span>
            <span>Votre tour</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon enemy">👹</span>
            <span>Tour ennemi</span>
          </div>
        </div>
        <div className="speed-info">
          <small>
            💨 Les acteurs rapides peuvent jouer plusieurs fois d'affilée !
          </small>
        </div>
      </div>
    </div>
  );
};

export default CombatTimeline;
