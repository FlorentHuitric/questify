import React from 'react';
import '../styles/LevelUpModal.css';

interface StatChange {
  label: string;
  oldValue: number;
  newValue: number;
}

interface LevelUpModalProps {
  show: boolean;
  onClose: () => void;
  oldStats: Record<string, number>;
  newStats: Record<string, number>;
  level: number;
}

const statLabels: Record<string, string> = {
  strength: 'Force',
  magic: 'Magie',
  vitality: 'Vitalité',
  spirit: 'Esprit',
  dexterity: 'Dextérité',
  luck: 'Chance',
  attack: 'Attaque',
  defense: 'Défense',
  magicAttack: 'Attaque Magique',
  magicDefense: 'Défense Magique',
  speed: 'Vitesse',
  hitRate: 'Précision',
  criticalRate: 'Critique',
  evadeRate: 'Esquive',
  maxHp: 'PV Max',
  maxMp: 'PM Max',
};

const LevelUpModal: React.FC<LevelUpModalProps> = ({ show, onClose, oldStats, newStats, level }) => {
  if (!show) return null;

  // Only show stats that changed
  const statChanges: StatChange[] = Object.keys(newStats)
    .filter(key => typeof oldStats[key] === 'number' && typeof newStats[key] === 'number' && oldStats[key] !== newStats[key])
    .map(key => ({
      label: statLabels[key] || key,
      oldValue: oldStats[key],
      newValue: newStats[key],
    }));

  return (
    <div className="levelup-modal-overlay">
      <div className="levelup-modal">
        <div className="levelup-header">
          <span className="levelup-title">Niveau {level} atteint !</span>
        </div>
        <div className="levelup-avatar-anim">
          <div className="levelup-arrow">⬆️</div>
        </div>
        <div className="levelup-stats">
          {statChanges.map(stat => (
            <div className="levelup-stat-row" key={stat.label}>
              <span className="levelup-stat-label">{stat.label}</span>
              <span className="levelup-stat-old">{stat.oldValue}</span>
              <span className="levelup-arrow-small">→</span>
              <span className="levelup-stat-new">{stat.newValue}</span>
            </div>
          ))}
        </div>
        <button className="levelup-close-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default LevelUpModal;
