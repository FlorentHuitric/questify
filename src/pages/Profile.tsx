// src/pages/Profile.tsx
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Equipment, ConsumableItem, EquipmentSlots, PlayerStats } from '../types/GameTypes';
import InventoryGrid from '../components/InventoryGrid';
import EquipmentSlotsComponent from '../components/EquipmentSlots';
import '../styles/Profile.css';
import '../styles/Inventory.css';


const Profile: React.FC = () => {
  const { 
    playerStats, 
    equipment,
    equippedItems, 
    gold, 
    crystals,
    equipItem,
    unequipItem,
    playerName,
    playerAvatar,
    getTotalStats
  } = useGame();

  // Debug: Afficher les stats du joueur
  console.log('PlayerStats dans Profile:', playerStats);

  const [draggedItem, setDraggedItem] = useState<{
    item: Equipment | ConsumableItem;
    source: 'inventory' | 'equipped';
    index?: number;
  } | null>(null);

  const handleDragStart = (item: Equipment | ConsumableItem, index: number) => {
    setDraggedItem({ item, source: 'inventory', index });
  };

  const handleEquipItem = (slot: keyof EquipmentSlots, item: Equipment) => {
    if (draggedItem?.source === 'inventory') {
      equipItem(item, slot);
    }
  };

  const handleUnequipItem = (slot: keyof EquipmentSlots) => {
    unequipItem(slot);
  };


  // Utilise la fonction du contexte pour avoir les stats finales (bonus inclus)
  const totalStats = getTotalStats();

  const getEquipmentBonus = (stat: keyof PlayerStats) => {
    let bonus = 0;
    Object.values(equippedItems).forEach(item => {
      if (item) {
        switch (stat) {
          case 'strength':
            bonus += item.strengthBonus;
            break;
          case 'magic':
            bonus += item.magicBonus;
            break;
          case 'vitality':
            bonus += item.vitalityBonus;
            break;
          case 'spirit':
            bonus += item.spiritBonus;
            break;
          case 'dexterity':
            bonus += item.dexterityBonus;
            break;
          case 'luck':
            bonus += item.luckBonus;
            break;
          case 'attack':
            bonus += item.attackBonus;
            break;
          case 'defense':
            bonus += item.defenseBonus;
            break;
          case 'magicAttack':
            bonus += item.magicAttackBonus;
            break;
          case 'magicDefense':
            bonus += item.magicDefenseBonus;
            break;
          case 'speed':
            bonus += item.speedBonus;
            break;
          case 'hitRate':
            bonus += item.hitRateBonus;
            break;
          case 'criticalRate':
            bonus += item.criticalRateBonus;
            break;
          case 'evadeRate':
            bonus += item.evadeRateBonus;
            break;
          case 'maxHp':
            bonus += item.hpBonus || 0;
            break;
          case 'maxMp':
            bonus += item.mpBonus || 0;
            break;
        }
      }
    });
    return bonus;
  };

  // Filtrer les équipements de l'inventaire
  const equipmentItems = equipment;

  return (
    <div className="inventory-container">
      <div className="stats-panel">
        <div className="profile-header" style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div className="avatar" style={{ marginRight: 18 }}>
            {playerAvatar ? (
              <img src={playerAvatar} alt="Avatar" style={{ width: 80, height: 80, borderRadius: 12, border: '3px solid #F1C40F' }} />
            ) : (
              <div style={{color: 'red', padding: 20}}>Avatar non défini</div>
            )}
          </div>
          <div className="info">
            <h2 style={{ color: '#F1C40F', fontFamily: 'Press Start 2P, cursive', margin: 0 }}>{playerName ? playerName : 'Aventurier'}</h2>
            <div style={{ fontSize: 16, color: '#fff', marginTop: 6 }}>Niveau {playerStats.level}</div>
            <div style={{ fontSize: 14, color: '#fff' }}>XP : {playerStats.xp} / {playerStats.maxXp}</div>
          </div>
        </div>

        <div className="stats-section">
          <h3>💰 Devises</h3>
          <div className="stat-item">
            <span className="stat-label">Or</span>
            <span className="stat-value">{gold}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cristaux</span>
            <span className="stat-value">{crystals}</span>
          </div>
        </div>

        <div className="stats-section">
          <h3>⚔️ Statistiques Principales</h3>
          <div className="stat-item">
            <span className="stat-label">Force</span>
            <span className="stat-value">
              {playerStats.strength}
              {getEquipmentBonus('strength') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('strength')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Magie</span>
            <span className="stat-value">
              {playerStats.magic}
              {getEquipmentBonus('magic') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('magic')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Vitalité</span>
            <span className="stat-value">
              {playerStats.vitality}
              {getEquipmentBonus('vitality') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('vitality')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Esprit</span>
            <span className="stat-value">
              {playerStats.spirit}
              {getEquipmentBonus('spirit') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('spirit')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Dextérité</span>
            <span className="stat-value">
              {playerStats.dexterity}
              {getEquipmentBonus('dexterity') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('dexterity')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Chance</span>
            <span className="stat-value">
              {playerStats.luck}
              {getEquipmentBonus('luck') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('luck')}</span>
              )}
            </span>
          </div>
        </div>

        <div className="stats-section">
          <h3>⚔️ Statistiques de Combat</h3>
          <div className="stat-item">
            <span className="stat-label">Attaque</span>
            <span className="stat-value">
              {totalStats.attack}
              {getEquipmentBonus('attack') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('attack')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Défense</span>
            <span className="stat-value">
              {totalStats.defense}
              {getEquipmentBonus('defense') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('defense')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Att. Magique</span>
            <span className="stat-value">
              {totalStats.magicAttack}
              {getEquipmentBonus('magicAttack') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('magicAttack')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Déf. Magique</span>
            <span className="stat-value">
              {totalStats.magicDefense}
              {getEquipmentBonus('magicDefense') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('magicDefense')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Vitesse</span>
            <span className="stat-value">
              {totalStats.speed}
              {getEquipmentBonus('speed') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('speed')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Précision</span>
            <span className="stat-value">
              {totalStats.hitRate}%
              {getEquipmentBonus('hitRate') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('hitRate')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Critique</span>
            <span className="stat-value">
              {totalStats.criticalRate}%
              {getEquipmentBonus('criticalRate') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('criticalRate')}</span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Esquive</span>
            <span className="stat-value">
              {totalStats.evadeRate}%
              {getEquipmentBonus('evadeRate') > 0 && (
                <span className="stat-bonus">+{getEquipmentBonus('evadeRate')}</span>
              )}
            </span>
          </div>
        </div>

        <div className="hp-mp-bars">
          <div className="stat-bar">
            <label>PV</label>
            <div className="bar hp-bar">
              <div 
                className="bar-fill" 
                style={{ width: `${(playerStats.hp / totalStats.maxHp) * 100}%` }}
              />
              <span>{playerStats.hp}/{totalStats.maxHp}</span>
            </div>
          </div>
          <div className="stat-bar">
            <label>PM</label>
            <div className="bar mp-bar">
              <div 
                className="bar-fill" 
                style={{ width: `${(playerStats.mp / totalStats.maxMp) * 100}%` }}
              />
              <span>{playerStats.mp}/{totalStats.maxMp}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="equipment-panel">
        <h3>⚔️ Équipement</h3>
        <EquipmentSlotsComponent
          equippedItems={equippedItems}
          onDrop={handleEquipItem}
          onUnequip={handleUnequipItem}
        />
      </div>

      <div className="inventory-panel">
        <h3>🎒 Inventaire</h3>
        <InventoryGrid
          items={equipmentItems}
          onDragStart={handleDragStart}
          gridSize={40}
        />
      </div>
    </div>
  );
};

export default Profile;
