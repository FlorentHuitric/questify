// src/pages/Combat.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CombatSystem } from '../systems/CombatSystem';
import { Enemy, CombatAction, ConsumableItem } from '../types/GameTypes';
import { useGame } from '../contexts/GameContext';
import CombatTimeline from '../components/CombatTimeline';
import SpeedDisplay from '../components/SpeedDisplay';
import '../styles/Combat.css';

const Combat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enemy } = location.state as { enemy: Enemy };
  const { inventory, useItem, addItem, addGold, getEnemyDrops, updatePlayerStats, getTotalStats, getActiveTeam } = useGame();

  // Récupère l'équipe active (joueur + équipiers)
  const activeTeam = getActiveTeam();
  const [combatSystem, setCombatSystem] = useState(() => new CombatSystem(activeTeam, enemy));
  const [combatState, setCombatState] = useState(combatSystem.getState());

  // Réinitialise le système de combat si l'équipe ou l'ennemi change
  React.useEffect(() => {
    const newSystem = new CombatSystem(getActiveTeam(), enemy);
    setCombatSystem(newSystem);
    setCombatState(newSystem.getState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(activeTeam.map(c => c.id)), enemy.id]);
  // TODO: Utiliser activeTeam pour supporter le multi-personnage en combat
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showSpells, setShowSpells] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [rewardsGiven, setRewardsGiven] = useState(false);

  // Fonction pour synchroniser les stats du combat avec les stats du joueur
  const syncPlayerStats = () => {
    const currentCombatStats = combatSystem.getState().playerStats;
    const baseStats = getTotalStats();
    
    // Seuls les HP et MP changent pendant le combat, pas les stats de base
    updatePlayerStats({
      hp: Math.min(currentCombatStats.hp, baseStats.maxHp),
      mp: Math.min(currentCombatStats.mp, baseStats.maxMp)
    });
  };

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

  // Supprimer handleCombatEnd et useEffect qui causent la boucle infinie
  // La logique est maintenant uniquement dans le onClick du bouton

  const handleAction = async (action: CombatAction) => {
    if (animating || !combatSystem.isPlayerTurn()) return;
    
    setAnimating(true);
    setSelectedAction(action.type);
    
    // Exécuter l'action du joueur
    combatSystem.executePlayerAction(action);
    setCombatState(combatSystem.getState());
    
    // Attendre l'animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Continuer à jouer les tours ennemis tant que c'est leur tour
    await processEnemyTurns();
    
    // Mettre à jour l'état après toutes les actions
    setCombatState(combatSystem.getState());
    
    setAnimating(false);
    setSelectedAction(null);
    setShowSpells(false);
    setShowItems(false);
  };

  const processEnemyTurns = async () => {
    while (!combatSystem.isCombatFinished() && !combatSystem.isPlayerTurn()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      combatSystem.executeEnemyAction();
      setCombatState(combatSystem.getState());
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
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

  // Affiche les actions pour le personnage dont c'est le tour
  const renderActionButtons = () => {
    const actorId = combatSystem.getCurrentActor();
    const actor = activeTeam.find(a => a.id === actorId);
    if (!actor || combatState.phase !== 'action-selection') return null;

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
              disabled={animating || item.quantity <= 0}
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
              disabled={animating}
              className={`action-button ${spell.type}`}
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
        <div style={{ marginBottom: 8, color: '#F1C40F', fontWeight: 'bold' }}>
          {actor.sprite} {actor.name} ({actor.rarity}) - Tour de ce personnage
        </div>
        {availableActions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              if (action.type === 'magic') setShowSpells(true);
              else if (action.type === 'item') setShowItems(true);
              else handleAction(action);
            }}
            disabled={animating}
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
          <div className="team-avatars" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {combatState.allies && combatState.allies.map((member: any, idx: number) => (
              <div key={member.id} className={`team-member-avatar${idx === 0 ? ' main' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 40 }}>{member.sprite}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: idx === 0 ? '#F1C40F' : '#fff' }}>{member.name}</span>
                  <span style={{ fontSize: 12, color: '#aaa' }}>Lv.{member.level} {member.rarity}</span>
                  <span style={{ fontSize: 12, color: member.baseStats.hp > 0 ? '#e74c3c' : '#888' }}>PV: {member.baseStats.hp}</span>
                  <span style={{ fontSize: 12, color: '#3498db' }}>ATK: {member.baseStats.attack} DEF: {member.baseStats.defense}</span>
                  <span style={{ fontSize: 12, color: '#9b59b6' }}>MAG: {member.baseStats.magic} SPD: {member.baseStats.speed}</span>
                </div>
              </div>
            ))}
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

      {/* Timeline des tours et affichage de la vitesse */}
      <div className="combat-info-panel">
        <CombatTimeline 
          turnOrder={combatState.turnOrder}
          currentTurn={combatState.currentTurn}
          playerName="Joueur"
          enemyName={combatState.enemy.name}
        />
        
        <SpeedDisplay 
          playerStats={combatState.playerStats}
          enemy={combatState.enemy}
        />
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
              ? 'Cliquez pour retourner à la carte et récupérer vos récompenses !' 
              : 'Cliquez pour retourner à la carte...'}
          </p>
          <button 
            className="return-button" 
            onClick={() => {
              if (!rewardsGiven) {
                setRewardsGiven(true);
                if (combatState.phase === 'victory') {
                  const rewards = combatSystem.getVictoryRewards();
                  const drops = getEnemyDrops(enemy);
                  
                  // Mettre à jour les stats du joueur avec les stats finales du combat
                  syncPlayerStats();
                  
                  // Ajouter les récompenses
                  addGold(rewards.gold + drops.gold);
                  drops.items.forEach(item => addItem(item));
                  
                  let message = `🎉 Victoire ! +${rewards.xp} XP, +${rewards.gold + drops.gold} Or !`;
                  if (drops.items.length > 0) {
                    message += `\n🎁 Objets trouvés : ${drops.items.map(item => item.name).join(', ')}`;
                  }
                  
                  navigate('/map', { 
                    state: { 
                      victory: true, 
                      rewards: { ...rewards, gold: rewards.gold + drops.gold },
                      drops: drops.items,
                      message
                    }
                  });
                } else if (combatState.phase === 'defeat') {
                  // Mettre à jour les stats du joueur même en cas de défaite
                  syncPlayerStats();
                  
                  navigate('/map', { 
                    state: { 
                      defeat: true,
                      message: 'Défaite... Réessayez plus tard !'
                    }
                  });
                }
              } else {
                navigate('/map');
              }
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
