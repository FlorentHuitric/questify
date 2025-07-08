// src/contexts/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerStats, ConsumableItem, Equipment, Enemy, Currency } from '../types/GameTypes';
import { initialPlayerStats, consumableItems, shopItems } from '../data/GameData';

interface GameContextType {
  playerStats: PlayerStats;
  inventory: ConsumableItem[];
  equipment: Equipment[];
  currency: Currency;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  useItem: (itemId: string) => boolean;
  addItem: (item: ConsumableItem) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
  getEnemyDrops: (enemy: Enemy) => { items: ConsumableItem[]; gold: number };
  equipItem: (item: Equipment) => void;
  buyItem: (itemId: string, cost: number, currencyType: 'gold' | 'gems') => boolean;
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
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [currency, setCurrency] = useState<Currency>({ gold: 100, gems: 0 }); // Monnaie de départ
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les données sauvegardées au démarrage - une seule fois
  useEffect(() => {
    if (!isLoaded) {
      loadGame();
      setIsLoaded(true);
    }
  }, [isLoaded]);

  // Sauvegarder automatiquement
  useEffect(() => {
    if (isLoaded) {
      const autoSave = setInterval(() => {
        saveGame();
      }, 30000); // Sauvegarde toutes les 30 secondes

      return () => clearInterval(autoSave);
    }
  }, [isLoaded]); // Seulement quand les données sont chargées

  const updatePlayerStats = (stats: Partial<PlayerStats>) => {
    setPlayerStats(prev => ({ ...prev, ...stats }));
  };

  const useItem = (itemId: string): boolean => {
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1 || inventory[itemIndex].quantity <= 0) {
      return false;
    }

    const item = inventory[itemIndex];
    const newInventory = [...inventory];
    newInventory[itemIndex] = { ...item, quantity: item.quantity - 1 };
    setInventory(newInventory);

    // Appliquer l'effet de l'objet
    switch (item.effect) {
      case 'heal':
        setPlayerStats(prev => ({
          ...prev,
          hp: Math.min(prev.maxHp, prev.hp + item.value)
        }));
        break;
      case 'mp-restore':
        setPlayerStats(prev => ({
          ...prev,
          mp: Math.min(prev.maxMp, prev.mp + item.value)
        }));
        break;
      case 'boost-strength':
        setPlayerStats(prev => ({
          ...prev,
          strength: prev.strength + item.value
        }));
        break;
      case 'boost-agility':
        setPlayerStats(prev => ({
          ...prev,
          agility: prev.agility + item.value
        }));
        break;
      case 'boost-wisdom':
        setPlayerStats(prev => ({
          ...prev,
          wisdom: prev.wisdom + item.value
        }));
        break;
    }

    return true;
  };

  const addItem = (newItem: ConsumableItem) => {
    const existingItemIndex = inventory.findIndex(item => item.id === newItem.id);
    
    if (existingItemIndex >= 0) {
      const newInventory = [...inventory];
      newInventory[existingItemIndex] = {
        ...newInventory[existingItemIndex],
        quantity: newInventory[existingItemIndex].quantity + newItem.quantity
      };
      setInventory(newInventory);
    } else {
      setInventory(prev => [...prev, newItem]);
    }
  };

  const addGold = (amount: number) => {
    setCurrency(prev => ({ ...prev, gold: prev.gold + amount }));
  };

  const spendGold = (amount: number): boolean => {
    if (currency.gold >= amount) {
      setCurrency(prev => ({ ...prev, gold: prev.gold - amount }));
      return true;
    }
    return false;
  };

  const addGems = (amount: number) => {
    setCurrency(prev => ({ ...prev, gems: prev.gems + amount }));
  };

  const spendGems = (amount: number): boolean => {
    if (currency.gems >= amount) {
      setCurrency(prev => ({ ...prev, gems: prev.gems - amount }));
      return true;
    }
    return false;
  };

  const buyItem = (itemId: string, cost: number, currencyType: 'gold' | 'gems'): boolean => {
    const canAfford = currencyType === 'gold' ? 
      currency.gold >= cost : 
      currency.gems >= cost;

    if (!canAfford) return false;

    // Trouver l'objet dans les données du shop
    const shopItem = shopItems.find(item => item.id === itemId);
    if (!shopItem) return false;

    // Déduire la monnaie
    if (currencyType === 'gold') {
      setCurrency(prev => ({ ...prev, gold: prev.gold - cost }));
    } else {
      setCurrency(prev => ({ ...prev, gems: prev.gems - cost }));
    }

    // Ajouter l'objet selon son type
    if (shopItem.category === 'consumable') {
      // Trouver l'objet consommable correspondant
      const consumableItem = consumableItems.find(item => item.id === itemId);
      if (consumableItem) {
        addItem({ ...consumableItem, quantity: 1 });
      }
    } else if (shopItem.category === 'weapon' || shopItem.category === 'armor' || shopItem.category === 'accessory') {
      // Créer un équipement
      const newEquipment: Equipment = {
        id: shopItem.id,
        name: shopItem.name,
        type: shopItem.category as 'weapon' | 'armor' | 'accessory',
        strengthBonus: shopItem.stats?.strength || 0,
        agilityBonus: shopItem.stats?.agility || 0,
        wisdomBonus: shopItem.stats?.wisdom || 0,
        constitutionBonus: shopItem.stats?.constitution || 0,
        sprite: shopItem.sprite
      };
      setEquipment(prev => [...prev, newEquipment]);
    }

    return true;
  };

  const equipItem = (item: Equipment) => {
    // Retirer l'équipement du même type s'il existe
    const newEquipment = equipment.filter(eq => eq.type !== item.type);
    newEquipment.push(item);
    setEquipment(newEquipment);
  };

  const getEnemyDrops = (enemy: Enemy): { items: ConsumableItem[]; gold: number } => {
    const drops: ConsumableItem[] = [];
    let goldDrop = enemy.goldReward;

    // Chances de drops basées sur le niveau de l'ennemi
    const dropChance = Math.min(0.3 + (enemy.level * 0.1), 0.8); // 30% à 80% selon le niveau
    
    if (Math.random() < dropChance) {
      // Drops possibles selon le type d'ennemi
      const possibleDrops: ConsumableItem[] = [
        {
          id: 'health_potion',
          name: 'Potion de Soin',
          description: 'Restaure 30 PV',
          effect: 'heal',
          value: 30,
          quantity: 1,
          sprite: '🧪'
        },
        {
          id: 'mana_potion',
          name: 'Potion de Mana',
          description: 'Restaure 20 PM',
          effect: 'mp-restore',
          value: 20,
          quantity: 1,
          sprite: '🔮'
        }
      ];

      // Sélectionner un drop aléatoire
      const randomDrop = possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
      drops.push(randomDrop);

      // Chance de drop bonus d'or
      if (Math.random() < 0.3) {
        goldDrop += Math.floor(enemy.goldReward * 0.5);
      }
    }

    return { items: drops, gold: goldDrop };
  };

  const saveGame = () => {
    const gameData = {
      playerStats,
      inventory,
      equipment,
      currency,
      timestamp: Date.now()
    };
    localStorage.setItem('questify_save', JSON.stringify(gameData));
  };

  const loadGame = () => {
    const savedData = localStorage.getItem('questify_save');
    if (savedData) {
      try {
        const gameData = JSON.parse(savedData);
        setPlayerStats(gameData.playerStats || initialPlayerStats);
        setInventory(gameData.inventory || consumableItems);
        setEquipment(gameData.equipment || []);
        setCurrency(gameData.currency || { gold: 100, gems: 0 });
      } catch (error) {
        console.error('Erreur lors du chargement de la sauvegarde:', error);
        // En cas d'erreur, réinitialiser avec les valeurs par défaut
        resetGame();
      }
    }
  };

  const resetGame = () => {
    setPlayerStats(initialPlayerStats);
    setInventory(consumableItems);
    setEquipment([]);
    setCurrency({ gold: 100, gems: 0 });
    localStorage.removeItem('questify_save');
  };

  const value: GameContextType = {
    playerStats,
    inventory,
    equipment,
    currency,
    updatePlayerStats,
    useItem,
    addItem,
    addGold,
    spendGold,
    addGems,
    spendGems,
    saveGame,
    loadGame,
    resetGame,
    getEnemyDrops,
    equipItem,
    buyItem
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
