// src/context/GameContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PlayerStats, ConsumableItem } from '../types/GameTypes';
import { initialPlayerStats, consumableItems } from '../data/GameData';

interface GameContextType {
  playerStats: PlayerStats;
  setPlayerStats: (stats: PlayerStats) => void;
  inventory: ConsumableItem[];
  setInventory: (inventory: ConsumableItem[]) => void;
  updateInventory: (itemId: string, newQuantity: number) => void;
  useItem: (itemId: string) => boolean;
  gold: number;
  setGold: (gold: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats>(initialPlayerStats);
  const [inventory, setInventory] = useState<ConsumableItem[]>(consumableItems);
  const [gold, setGold] = useState(100); // Or initial

  const updateInventory = (itemId: string, newQuantity: number) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(0, newQuantity) }
          : item
      )
    );
  };

  const useItem = (itemId: string): boolean => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.quantity <= 0) return false;
    
    updateInventory(itemId, item.quantity - 1);
    return true;
  };

  const value: GameContextType = {
    playerStats,
    setPlayerStats,
    inventory,
    setInventory,
    updateInventory,
    useItem,
    gold,
    setGold
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
