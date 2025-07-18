// src/pages/SphereGrid.tsx
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { sphereGrid } from '../data/SphereGrid';
import '../styles/SphereGrid.css';

const SphereGrid: React.FC = () => {
  const { pc, sphereNodesUnlocked, unlockSphereNode } = useGame();

  return (
    <div className="spheregrid-container">
      <h2 className="spheregrid-title">Sphérier</h2>
      <div className="spheregrid-points">PC disponibles : <strong>{pc}</strong></div>
      <div className="spheregrid-graph">
        {sphereGrid.map(node => (
          <div
            key={node.id}
            className={`spheregrid-node${sphereNodesUnlocked.includes(node.id) ? ' unlocked' : ''}`}
            title={node.label + (node.type === 'stat' ? ` (+${node.effect.value} ${node.effect.stat})` : node.type === 'skill' ? ' (Compétence)' : ' (Passif)')}
            onClick={() => unlockSphereNode(node.id)}
            style={{
              left: `calc(50% + ${(node.id.charCodeAt(0) - 99) * 120}px)`,
              top: `calc(50% + ${(parseInt(node.id.replace(/\D/g, '')) - 2) * 80}px)`
            }}
          >
            <span className="node-label">{node.label}</span>
            <span className="node-cost">{node.cost} PC</span>
          </div>
        ))}
      </div>
      <div className="spheregrid-legend">
        <span><span className="legend unlocked"></span>Débloqué</span>
        <span style={{ marginLeft: 18 }}><span className="legend locked"></span>Verrouillé</span>
      </div>
    </div>
  );
};

export default SphereGrid;
