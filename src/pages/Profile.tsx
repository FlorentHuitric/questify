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
    unequipItem
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

  const calculateTotalStats = () => {
    let totalStats = { ...playerStats };
    
    Object.values(equippedItems).forEach(item => {
      if (item) {
        totalStats.strength += item.strengthBonus;
        totalStats.magic += item.magicBonus;
        totalStats.vitality += item.vitalityBonus;
        totalStats.spirit += item.spiritBonus;
        totalStats.dexterity += item.dexterityBonus;
        totalStats.luck += item.luckBonus;
        totalStats.attack += item.attackBonus;
        totalStats.defense += item.defenseBonus;
        totalStats.magicAttack += item.magicAttackBonus;
        totalStats.magicDefense += item.magicDefenseBonus;
        totalStats.speed += item.speedBonus;
        totalStats.hitRate += item.hitRateBonus;
        totalStats.criticalRate += item.criticalRateBonus;
        totalStats.evadeRate += item.evadeRateBonus;
        if (item.hpBonus) totalStats.maxHp += item.hpBonus;
        if (item.mpBonus) totalStats.maxMp += item.mpBonus;
      }
    });
    
    return totalStats;
  };

  const totalStats = calculateTotalStats();

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
        <div className="stats-section">
          <h3>🧙‍♂️ Personnage</h3>
          <div className="stat-item">
            <span className="stat-label">Niveau</span>
            <span className="stat-value">{playerStats.level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">XP</span>
            <span className="stat-value">{playerStats.xp} / {playerStats.maxXp}</span>
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
