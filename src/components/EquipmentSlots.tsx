// src/components/EquipmentSlots.tsx
import React from 'react';
import { Equipment, EquipmentSlots } from '../types/GameTypes';

interface EquipmentSlotsProps {
  equippedItems: EquipmentSlots;
  onDrop: (slot: keyof EquipmentSlots, item: Equipment) => void;
  onUnequip: (slot: keyof EquipmentSlots) => void;
}

const EquipmentSlotsComponent: React.FC<EquipmentSlotsProps> = ({
  equippedItems,
  onDrop,
  onUnequip
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slot: keyof EquipmentSlots) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const item = data.item as Equipment;
      
      // Vérifier si l'item peut être équipé dans ce slot
      if (canEquipInSlot(item, slot)) {
        onDrop(slot, item);
      }
    } catch (error) {
      console.error('Erreur lors du drop:', error);
    }
  };

  const canEquipInSlot = (item: Equipment, slot: keyof EquipmentSlots): boolean => {
    // Logique pour vérifier si un item peut être équipé dans un slot
    if (slot === 'ring1' || slot === 'ring2') {
      return item.type === 'ring';
    }
    return item.type === slot;
  };

  const handleUnequip = (slot: keyof EquipmentSlots) => {
    onUnequip(slot);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#ffffff';
      case 'rare': return '#0070f3';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#ffffff';
    }
  };

  const renderSlot = (slot: keyof EquipmentSlots, label: string, className: string) => {
    const item = equippedItems[slot];
    
    return (
      <div
        className={`equipment-slot ${className} ${item ? 'has-item' : ''}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, slot)}
        onClick={() => item && handleUnequip(slot)}
      >
        <div className="slot-label">{label}</div>
        {item ? (
          <div
            className="equipped-item"
            style={{
              borderColor: getRarityColor(item.rarity)
            }}
          >
            <div className="item-sprite">{item.sprite}</div>
            <div className="item-tooltip">
              <div className="item-name">{item.name}</div>
              <div className="item-description">{item.description}</div>
              <div className="item-stats">
                {item.strengthBonus > 0 && <div>Force: +{item.strengthBonus}</div>}
                {item.agilityBonus > 0 && <div>Agilité: +{item.agilityBonus}</div>}
                {item.wisdomBonus > 0 && <div>Sagesse: +{item.wisdomBonus}</div>}
                {item.constitutionBonus > 0 && <div>Constitution: +{item.constitutionBonus}</div>}
                {item.hpBonus && <div>PV: +{item.hpBonus}</div>}
                {item.mpBonus && <div>PM: +{item.mpBonus}</div>}
              </div>
              <div className="item-rarity" style={{ color: getRarityColor(item.rarity) }}>
                {item.rarity}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-slot">
            <div className="slot-icon">
              {getSlotIcon(slot)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getSlotIcon = (slot: keyof EquipmentSlots): string => {
    switch (slot) {
      case 'weapon': return '⚔️';
      case 'helmet': return '🪖';
      case 'armor': return '🛡️';
      case 'boots': return '👢';
      case 'gloves': return '🧤';
      case 'ring1':
      case 'ring2': return '💍';
      case 'amulet': return '🔮';
      case 'shield': return '🛡️';
      default: return '❓';
    }
  };

  return (
    <div className="equipment-slots">
      <div className="character-model">
        <div className="avatar">🧙‍♂️</div>
      </div>
      
      <div className="equipment-grid">
        {/* Ligne du haut */}
        <div className="equipment-row top">
          {renderSlot('helmet', 'Casque', 'helmet')}
          {renderSlot('amulet', 'Amulette', 'amulet')}
        </div>
        
        {/* Ligne du milieu */}
        <div className="equipment-row middle">
          {renderSlot('weapon', 'Arme', 'weapon')}
          {renderSlot('armor', 'Armure', 'armor')}
          {renderSlot('shield', 'Bouclier', 'shield')}
        </div>
        
        {/* Ligne du bas */}
        <div className="equipment-row bottom">
          {renderSlot('gloves', 'Gants', 'gloves')}
          {renderSlot('boots', 'Bottes', 'boots')}
        </div>
        
        {/* Anneaux */}
        <div className="equipment-row rings">
          {renderSlot('ring1', 'Anneau 1', 'ring')}
          {renderSlot('ring2', 'Anneau 2', 'ring')}
        </div>
      </div>
    </div>
  );
};

export default EquipmentSlotsComponent;
