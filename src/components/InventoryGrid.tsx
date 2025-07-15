// src/components/InventoryGrid.tsx
import React from 'react';
import { Equipment, ConsumableItem } from '../types/GameTypes';

interface InventoryGridProps {
  items: (Equipment | ConsumableItem)[];
  onDragStart: (item: Equipment | ConsumableItem, index: number) => void;
  onItemClick?: (item: Equipment | ConsumableItem) => void;
  gridSize?: number;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
  items,
  onDragStart,
  onItemClick,
  gridSize = 40
}) => {
  const handleDragStart = (e: React.DragEvent, item: Equipment | ConsumableItem, index: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      item,
      source: 'inventory',
      index
    }));
    onDragStart(item, index);
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return '#ffffff';
      case 'rare': return '#0070f3';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#ffffff';
    }
  };

  return (
    <div className="inventory-grid">
      {Array.from({ length: gridSize }, (_, index) => {
        const item = items[index];
        return (
          <div
            key={index}
            className={`inventory-slot ${item ? 'has-item' : ''}`}
            onClick={() => item && onItemClick?.(item)}
          >
            {item && (
              <div
                className="inventory-item"
                draggable
                onDragStart={(e) => handleDragStart(e, item, index)}
                style={{
                  borderColor: getRarityColor('rarity' in item ? item.rarity : undefined)
                }}
              >
                <div className="item-sprite">{item.sprite}</div>
                {'quantity' in item && item.quantity > 1 && (
                  <div className="item-quantity">{item.quantity}</div>
                )}
                <div className="item-tooltip">
                  <div className="item-name">{item.name}</div>
                  <div className="item-description">{item.description}</div>
                  {'rarity' in item && (
                    <div className="item-rarity" style={{ color: getRarityColor(item.rarity) }}>
                      {item.rarity}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InventoryGrid;
