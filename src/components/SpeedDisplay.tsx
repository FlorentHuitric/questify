// src/components/SpeedDisplay.tsx
import React from 'react';
import { PlayerStats, Enemy } from '../types/GameTypes';
import '../styles/SpeedDisplay.css';

interface SpeedDisplayProps {
  playerStats: PlayerStats;
  enemy: Enemy;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({ playerStats, enemy }) => {
  const playerSpeed = playerStats.speed || playerStats.dexterity * 2;
  const enemySpeed = enemy.agility || 20;
  
  // Calculer qui est le plus rapide
  const speedDifference = playerSpeed - enemySpeed;
  const speedAdvantage = speedDifference > 0 ? 'player' : speedDifference < 0 ? 'enemy' : 'equal';
  
  // Calculer approximativement le ratio de tours
  const getSpeedRatio = () => {
    if (speedAdvantage === 'equal') return '1:1';
    if (speedAdvantage === 'player') {
      const ratio = Math.round((playerSpeed / enemySpeed) * 10) / 10;
      return `${ratio}:1`;
    } else {
      const ratio = Math.round((enemySpeed / playerSpeed) * 10) / 10;
      return `1:${ratio}`;
    }
  };

  return (
    <div className="speed-display">
      <h3>⚡ Analyse de Vitesse</h3>
      
      <div className="speed-comparison">
        <div className="speed-stat player">
          <div className="speed-header">
            <span className="speed-icon">🗡️</span>
            <span className="speed-label">Votre Vitesse</span>
          </div>
          <div className="speed-value">{playerSpeed}</div>
          <div className="speed-breakdown">
            {playerStats.speed ? (
              <span>Vitesse: {playerStats.speed}</span>
            ) : (
              <span>Dextérité × 2: {playerStats.dexterity} × 2</span>
            )}
          </div>
        </div>

        <div className="speed-vs">
          <div className="vs-indicator">VS</div>
          <div className="speed-advantage">
            {speedAdvantage === 'player' && (
              <div className="advantage player">
                <span>🏃‍♂️ Vous êtes plus rapide !</span>
              </div>
            )}
            {speedAdvantage === 'enemy' && (
              <div className="advantage enemy">
                <span>🏃‍♀️ L'ennemi est plus rapide !</span>
              </div>
            )}
            {speedAdvantage === 'equal' && (
              <div className="advantage equal">
                <span>⚖️ Vitesse égale</span>
              </div>
            )}
          </div>
        </div>

        <div className="speed-stat enemy">
          <div className="speed-header">
            <span className="speed-icon">👹</span>
            <span className="speed-label">Vitesse Ennemie</span>
          </div>
          <div className="speed-value">{enemySpeed}</div>
          <div className="speed-breakdown">
            <span>Agilité: {enemySpeed}</span>
          </div>
        </div>
      </div>

      <div className="speed-effects">
        <div className="effect-item">
          <strong>Ratio de tours:</strong> {getSpeedRatio()}
        </div>
        <div className="effect-item">
          <strong>Système CT:</strong> 
          <span className="ct-explanation">
            Chaque acteur accumule des points CT selon sa vitesse. 
            À 100 CT, c'est votre tour !
          </span>
        </div>
      </div>

      <div className="speed-tips">
        <h4>💡 Conseils</h4>
        <ul>
          <li>🏃‍♂️ Une vitesse élevée permet de jouer plusieurs fois d'affilée</li>
          <li>⚔️ L'équipement peut améliorer votre vitesse</li>
          <li>🎯 Utilisez votre avantage de vitesse pour enchaîner les attaques</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeedDisplay;
