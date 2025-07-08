// src/pages/Combat.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CombatSystem } from '../systems/CombatSystem';
import { Enemy, CombatAction, ConsumableItem } from '../types/GameTypes';
import { useGame } from '../contexts/GameContext';
import '../styles/Combat.css';

const Combat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enemy } = location.state as { enemy: Enemy };
  const { playerStats, inventory, useItem, addItem, addGold, getEnemyDrops, updatePlayerStats } = useGame();
  
  const [combatSystem] = useState(() => new CombatSystem(playerStats, enemy));
  const [combatState, setCombatState] = useState(combatSystem.getState());
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showSpells, setShowSpells] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [rewardsGiven, setRewardsGiven] = useState(false);

  const availableActions: CombatAction[] = [
    { type: 'attack', name: 'Attaquer', accuracy: 0.85, description: 'Attaque physique de base' },
    { type: 'magic', name: 'Magie', accuracy: 0.90, mpCost: 10, description: 'Attaque magique' },
    { type: 'item', name: 'Objets', accuracy: 1.0, description: 'Utiliser un objet' },
    { type: 'defend', name: 'Défendre', accuracy: 1.0, description: 'Réduit les dégâts et récupère du MP' },
    { type: 'flee', name: 'Fuir', accuracy: 0.7, description: 'Tenter de fuir le combat' }
  ];

  const spells: CombatAction[] = [
    { type: 'magic', name: 'Boule de Feu', accuracy: 0.85, mpCost: 8, description: 'Attaque de feu' },
    { type: 'magic', name: 'Éclair', accuracy: 0.90, mpCost: 12, description: 'Attaque de foudre' },
    { type: 'magic', name: 'Soin', accuracy: 1.0, mpCost: 15, healAmount: 30, description: 'Récupère des PV' }
  ];

  // Gérer la fin du combat - plus de useEffect automatique
  const handleCombatEnd = () => {
    if ((combatState.phase === 'victory' || combatState.phase === 'defeat') && !rewardsGiven) {
      setRewardsGiven(true);
      
      // Synchroniser les stats du joueur avec le contexte global
      const currentState = combatSystem.getState();
      updatePlayerStats(currentState.playerStats);
      
      setTimeout(() => {
        if (combatState.phase === 'victory') {
          const rewards = combatSystem.getVictoryRewards();
          const drops = getEnemyDrops(enemy);
          
          // Ajouter les récompenses
          addGold(rewards.gold + drops.gold);
          drops.items.forEach(item => addItem(item));
          
          let message = `🎉 Victoire ! +${rewards.xp} XP, +${rewards.gold + drops.gold} Or !`;
          if (drops.items.length > 0) {
            message += `\n🎁 Objets trouvés : ${drops.items.map(item => item.name).join(', ')}`;
          }
          
          // Utiliser navigate normalement
          navigate('/map', { 
            state: { 
              victory: true, 
              rewards: { ...rewards, gold: rewards.gold + drops.gold },
              drops: drops.items,
              message
            }
          });
        } else if (combatState.phase === 'defeat') {
          navigate('/map', { 
            state: { 
              defeat: true,
              message: 'Défaite... Réessayez plus tard !'
            }
          });
        }
      }, 2000);
    }
  };

  const handleAction = async (action: CombatAction) => {
    if (animating || !combatSystem.isPlayerTurn()) return;
    
    setAnimating(true);
    setSelectedAction(action.type);
    
    // Exécuter l'action du joueur
    combatSystem.executePlayerAction(action);
    setCombatState(combatSystem.getState());
    
    // Attendre l'animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Si le combat n'est pas fini, tour de l'ennemi
    if (!combatSystem.isCombatFinished()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      combatSystem.executeEnemyAction();
      setCombatState(combatSystem.getState());
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Mettre à jour l'état après toutes les actions
    setCombatState(combatSystem.getState());
    
    setAnimating(false);
    setSelectedAction(null);
    setShowSpells(false);
    setShowItems(false);
  };

  const handleItemUse = (item: ConsumableItem) => {
    if (item.quantity <= 0) return;
    
    // Utiliser l'objet via le contexte global
    const success = useItem(item.id);
    if (!success) return;

    // Créer une action pour le système de combat
    const itemAction: CombatAction = {
      type: 'item',
      name: item.name,
      accuracy: 1.0,
      description: item.description,
      healAmount: item.effect === 'heal' ? item.value : undefined
    };
    
    handleAction(itemAction);
  };

  const renderActionButtons = () => {
    if (showItems) {
      return (
        <div className="action-buttons">
          <button 
            onClick={() => setShowItems(false)}
            className="back-button"
          >
            ← Retour
          </button>
          {inventory.filter(item => item.quantity > 0).map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemUse(item)}
              disabled={animating || !combatSystem.isPlayerTurn() || item.quantity <= 0}
              className={`action-button item ${item.quantity <= 0 ? 'disabled' : ''}`}
            >
              <div className="item-sprite">{item.sprite}</div>
              <div className="action-name">{item.name}</div>
              <div className="action-description">{item.description}</div>
              <div className="item-quantity">x{item.quantity}</div>
            </button>
          ))}
        </div>
      );
    }

    if (showSpells) {
      return (
        <div className="action-buttons">
          <button 
            onClick={() => setShowSpells(false)}
            className="back-button"
          >
            ← Retour
          </button>
          {spells.map((spell, index) => (
            <button
              key={index}
              onClick={() => handleAction(spell)}
              disabled={animating || !combatSystem.isPlayerTurn() || (combatState.playerStats.mp < (spell.mpCost || 0))}
              className={`action-button ${spell.type} ${spell.mpCost && combatState.playerStats.mp < spell.mpCost ? 'disabled' : ''}`}
            >
              <div className="action-name">{spell.name}</div>
              <div className="action-cost">MP: {spell.mpCost || 0}</div>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="action-buttons">
        {availableActions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              if (action.type === 'magic') setShowSpells(true);
              else if (action.type === 'item') setShowItems(true);
              else handleAction(action);
            }}
            disabled={animating || !combatSystem.isPlayerTurn()}
            className={`action-button ${action.type} ${selectedAction === action.type ? 'selected' : ''}`}
          >
            <div className="action-name">{action.name}</div>
            <div className="action-description">{action.description}</div>
            {action.mpCost && <div className="action-cost">MP: {action.mpCost}</div>}
          </button>
        ))}
      </div>
    );
  };

  const renderCombatLog = () => {
    const lastTurns = combatState.combatLog.slice(-3);
    return (
      <div className="combat-log">
        <h3>Historique du combat</h3>
        {lastTurns.map((turn, index) => (
          <div key={index} className={`log-entry ${turn.actor}`}>
            <strong>{turn.actor === 'player' ? 'Vous' : combatState.enemy.name}</strong>
            {turn.action.type === 'attack' && (
              <span>
                {turn.missed ? ' a raté son attaque !' : 
                 turn.critical ? ` inflige ${turn.damage} dégâts critiques !` :
                 ` inflige ${turn.damage} dégâts !`}
              </span>
            )}
            {turn.action.type === 'magic' && (
              <span>
                {turn.missed ? ` a raté ${turn.action.name} !` : 
                 ` lance ${turn.action.name} et inflige ${turn.damage} dégâts !`}
              </span>
            )}
            {turn.action.type === 'defend' && <span> se défend !</span>}
            {turn.action.type === 'flee' && (
              <span>{turn.missed ? ' a échoué à fuir !' : ' a fui le combat !'}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="combat-container">
      <div className="combat-header">
        <h1>Combat contre {combatState.enemy.name}</h1>
        <div className="turn-indicator">
          {combatState.phase === 'victory' ? '🏆 Victoire !' :
           combatState.phase === 'defeat' ? '💀 Défaite...' :
           combatSystem.isPlayerTurn() ? '⚔️ Votre tour' : '🛡️ Tour de l\'ennemi'}
        </div>
      </div>

      <div className="battle-field">
        <div className="player-side">
          <div className={`player-avatar ${selectedAction ? 'attacking' : ''}`}>
            🧙‍♂️
          </div>
          <div className="stats-display">
            <div className="stat-bar">
              <label>PV</label>
              <div className="bar hp-bar">
                <div 
                  className="bar-fill" 
                  style={{ width: `${(combatState.playerStats.hp / combatState.playerStats.maxHp) * 100}%` }}
                />
                <span>{combatState.playerStats.hp}/{combatState.playerStats.maxHp}</span>
              </div>
            </div>
            <div className="stat-bar">
              <label>PM</label>
              <div className="bar mp-bar">
                <div 
                  className="bar-fill" 
                  style={{ width: `${(combatState.playerStats.mp / combatState.playerStats.maxMp) * 100}%` }}
                />
                <span>{combatState.playerStats.mp}/{combatState.playerStats.maxMp}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="enemy-side">
          <div className={`enemy-avatar ${combatState.combatLog.length > 0 && combatState.combatLog[combatState.combatLog.length - 1]?.actor === 'enemy' ? 'attacking' : ''}`}>
            {combatState.enemy.sprite}
          </div>
          <div className="stats-display">
            <h3>{combatState.enemy.name} (Niv. {combatState.enemy.level})</h3>
            <div className="stat-bar">
              <label>PV</label>
              <div className="bar hp-bar">
                <div 
                  className="bar-fill" 
                  style={{ width: `${(combatState.enemy.hp / combatState.enemy.maxHp) * 100}%` }}
                />
                <span>{combatState.enemy.hp}/{combatState.enemy.maxHp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderCombatLog()}

      {!combatSystem.isCombatFinished() && !animating && combatSystem.isPlayerTurn() && (
        <div className="action-panel">
          <h3>Que voulez-vous faire ?</h3>
          {renderActionButtons()}
        </div>
      )}

      {combatSystem.isCombatFinished() && !animating && (
        <div className="combat-end-message">
          <h2>
            {combatState.phase === 'victory' ? '🏆 Victoire !' : '💀 Défaite...'}
          </h2>
          <p>
            {combatState.phase === 'victory' 
              ? 'Retour à la carte dans quelques secondes...' 
              : 'Vous serez ramené à la carte...'}
          </p>
          <button 
            className="return-button" 
            onClick={() => {
              // Sauvegarder les stats du joueur après le combat
              const currentState = combatSystem.getState();
              updatePlayerStats(currentState.playerStats);
              
              // Naviguer vers la carte
              navigate('/map');
            }}
          >
            Retour à la carte
          </button>
        </div>
      )}

      {animating && (
        <div className="action-feedback">
          <div className="loading-spinner">⚡</div>
          <p>Action en cours...</p>
        </div>
      )}
    </div>
  );
};

export default Combat;
