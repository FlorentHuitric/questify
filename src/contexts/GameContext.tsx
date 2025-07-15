// src/contexts/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerStats, ConsumableItem, Equipment, Enemy, Currency, EquipmentSlots } from '../types/GameTypes';
import { initialPlayerStats, consumableItems, shopItems, basicEquipment } from '../data/GameData';

interface GameContextType {
  playerStats: PlayerStats;
  inventory: ConsumableItem[];
  equipment: Equipment[];
  equippedItems: EquipmentSlots;
  currency: Currency;
  gold: number;
  crystals: number;
  getTotalStats: () => PlayerStats;
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
  equipItem: (item: Equipment, slot: keyof EquipmentSlots) => void;
  unequipItem: (slot: keyof EquipmentSlots) => void;
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
  const [equipment, setEquipment] = useState<Equipment[]>(basicEquipment);
  const [equippedItems, setEquippedItems] = useState<EquipmentSlots>({});
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
          dexterity: prev.dexterity + item.value
        }));
        break;
      case 'boost-wisdom':
        setPlayerStats(prev => ({
          ...prev,
          magic: prev.magic + item.value
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
      // Créer un équipement - mapper accessory vers des types spécifiques
      let equipmentType: Equipment['type'];
      let equipmentSlot: Equipment['slot'];
      
      if (shopItem.category === 'weapon') {
        equipmentType = 'weapon';
        equipmentSlot = 'weapon';
      } else if (shopItem.category === 'armor') {
        equipmentType = 'armor';
        equipmentSlot = 'armor';
      } else {
        // accessory - déterminer le type spécifique basé sur l'ID ou le nom
        if (shopItem.id.includes('ring')) {
          equipmentType = 'ring';
          equipmentSlot = 'ring1';
        } else if (shopItem.id.includes('amulet')) {
          equipmentType = 'amulet';
          equipmentSlot = 'amulet';
        } else if (shopItem.id.includes('helmet')) {
          equipmentType = 'helmet';
          equipmentSlot = 'helmet';
        } else if (shopItem.id.includes('boots')) {
          equipmentType = 'boots';
          equipmentSlot = 'boots';
        } else if (shopItem.id.includes('gloves')) {
          equipmentType = 'gloves';
          equipmentSlot = 'gloves';
        } else if (shopItem.id.includes('shield')) {
          equipmentType = 'shield';
          equipmentSlot = 'shield';
        } else {
          equipmentType = 'ring'; // Par défaut
          equipmentSlot = 'ring1';
        }
      }

      const newEquipment: Equipment = {
        id: shopItem.id,
        name: shopItem.name,
        type: equipmentType,
        slot: equipmentSlot,
        strengthBonus: shopItem.stats?.strength || 0,
        magicBonus: shopItem.stats?.magic || 0,
        vitalityBonus: shopItem.stats?.vitality || 0,
        spiritBonus: shopItem.stats?.spirit || 0,
        dexterityBonus: shopItem.stats?.dexterity || 0,
        luckBonus: shopItem.stats?.luck || 0,
        attackBonus: shopItem.stats?.attack || 0,
        defenseBonus: shopItem.stats?.defense || 0,
        magicAttackBonus: shopItem.stats?.magicAttack || 0,
        magicDefenseBonus: shopItem.stats?.magicDefense || 0,
        speedBonus: shopItem.stats?.speed || 0,
        hitRateBonus: shopItem.stats?.hitRate || 0,
        criticalRateBonus: shopItem.stats?.criticalRate || 0,
        evadeRateBonus: shopItem.stats?.evadeRate || 0,
        hpBonus: shopItem.stats?.hp,
        mpBonus: shopItem.stats?.mp,
        sprite: shopItem.sprite,
        rarity: shopItem.rarity,
        levelRequired: shopItem.levelRequired,
        description: shopItem.description
      };
      setEquipment(prev => [...prev, newEquipment]);
    }

    return true;
  };

  const equipItem = (item: Equipment, slot: keyof EquipmentSlots) => {
    // Vérifier si l'emplacement est valide pour cet équipement
    if (item.slot !== slot && !(item.type === 'ring' && (slot === 'ring1' || slot === 'ring2'))) {
      return; // Emplacement non valide
    }
    
    // Équiper l'item
    setEquippedItems(prev => ({
      ...prev,
      [slot]: item
    }));
    
    // Retirer l'item de l'inventaire
    setEquipment(prev => prev.filter(eq => eq.id !== item.id));
  };

  const unequipItem = (slot: keyof EquipmentSlots) => {
    const item = equippedItems[slot];
    if (!item) return;
    
    // Remettre l'item dans l'inventaire
    setEquipment(prev => [...prev, item]);
    
    // Retirer l'item des équipements
    setEquippedItems(prev => {
      const newEquipped = { ...prev };
      delete newEquipped[slot];
      return newEquipped;
    });
  };

  const calculateDerivedStats = (stats: PlayerStats): PlayerStats => {
    // S'assurer que toutes les stats de base sont définies
    const safeStats = {
      ...initialPlayerStats, // Commencer avec les stats par défaut
      ...stats, // Puis appliquer les stats passées en paramètre
    };
    
    const newStats = { ...safeStats };
    
    console.log('Stats d\'entrée:', stats);
    console.log('Stats sécurisées:', safeStats);
    
    // Calculer les stats dérivées comme dans Final Fantasy
    newStats.attack = Math.floor(safeStats.strength * 2 + safeStats.dexterity * 0.5);
    newStats.defense = Math.floor(safeStats.vitality * 1.5 + safeStats.strength * 0.2);
    newStats.magicAttack = Math.floor(safeStats.magic * 2 + safeStats.spirit * 0.5);
    newStats.magicDefense = Math.floor(safeStats.spirit * 1.2 + safeStats.magic * 0.3);
    newStats.speed = Math.floor(safeStats.dexterity * 2 + safeStats.luck * 0.3);
    newStats.hitRate = Math.floor(90 + safeStats.dexterity * 0.5 + safeStats.luck * 0.2);
    newStats.criticalRate = Math.floor(2 + safeStats.luck * 0.3 + safeStats.dexterity * 0.1);
    newStats.evadeRate = Math.floor(2 + safeStats.dexterity * 0.3 + safeStats.luck * 0.4);
    
    // Calculer HP et MP maximaux seulement s'ils ne sont pas déjà définis
    if (!newStats.maxHp || newStats.maxHp < 100) {
      newStats.maxHp = Math.floor(100 + safeStats.vitality * 8 + safeStats.level * 10);
    }
    if (!newStats.maxMp || newStats.maxMp < 20) {
      newStats.maxMp = Math.floor(20 + safeStats.spirit * 4 + safeStats.magic * 2 + safeStats.level * 3);
    }
    
    // S'assurer que les HP et MP actuels sont valides
    if (!newStats.hp || newStats.hp <= 0) {
      newStats.hp = newStats.maxHp;
    } else {
      newStats.hp = Math.min(newStats.hp, newStats.maxHp);
    }
    
    if (!newStats.mp || newStats.mp <= 0) {
      newStats.mp = newStats.maxMp;
    } else {
      newStats.mp = Math.min(newStats.mp, newStats.maxMp);
    }
    
    console.log('Stats calculées:', newStats);
    return newStats;
  };

  const getTotalStats = (): PlayerStats => {
    let totalStats = { ...playerStats };
    
    Object.values(equippedItems).forEach(item => {
      if (item) {
        // Stats principales
        totalStats.strength += item.strengthBonus;
        totalStats.magic += item.magicBonus;
        totalStats.vitality += item.vitalityBonus;
        totalStats.spirit += item.spiritBonus;
        totalStats.dexterity += item.dexterityBonus;
        totalStats.luck += item.luckBonus;
        // Stats dérivées (bonus directs)
        totalStats.attack += item.attackBonus;
        totalStats.defense += item.defenseBonus;
        totalStats.magicAttack += item.magicAttackBonus;
        totalStats.magicDefense += item.magicDefenseBonus;
        totalStats.speed += item.speedBonus;
        totalStats.hitRate += item.hitRateBonus;
        totalStats.criticalRate += item.criticalRateBonus;
        totalStats.evadeRate += item.evadeRateBonus;
        // Santé et mana
        if (item.hpBonus) totalStats.maxHp += item.hpBonus;
        if (item.mpBonus) totalStats.maxMp += item.mpBonus;
      }
    });
    
    // Recalculer les stats dérivées avec les bonus d'équipement
    return calculateDerivedStats(totalStats);
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
      equippedItems,
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
        const loadedStats = gameData.playerStats || initialPlayerStats;
        setPlayerStats(calculateDerivedStats(loadedStats));
        setInventory(gameData.inventory || consumableItems);
        setEquipment(gameData.equipment || basicEquipment);
        setEquippedItems(gameData.equippedItems || {});
        setCurrency(gameData.currency || { gold: 100, gems: 0 });
      } catch (error) {
        console.error('Erreur lors du chargement de la sauvegarde:', error);
        // En cas d'erreur, réinitialiser avec les valeurs par défaut
        resetGame();
      }
    } else {
      // Première fois - initialiser avec les stats dérivées
      setPlayerStats(calculateDerivedStats(initialPlayerStats));
    }
  };

  const resetGame = () => {
    setPlayerStats(calculateDerivedStats(initialPlayerStats));
    setInventory(consumableItems);
    setEquipment(basicEquipment);
    setEquippedItems({});
    setCurrency({ gold: 100, gems: 0 });
    localStorage.removeItem('questify_save');
  };

  const value: GameContextType = {
    playerStats,
    inventory,
    equipment,
    equippedItems,
    currency,
    gold: currency.gold,
    crystals: currency.gems, // Mapping gems -> crystals pour compatibilité
    getTotalStats,
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
    unequipItem,
    buyItem
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
