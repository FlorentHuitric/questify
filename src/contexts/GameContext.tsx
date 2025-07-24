
// Helpers pour progression des persos gatcha
import { GatchaRarity, GatchaCharacter } from '../types/GatchaTypes';

function getInitialXpForRarity(rarity: GatchaRarity): number {
  switch (rarity) {
    case 'SSR': return 100;
    case 'SR': return 80;
    case 'R': return 60;
    case 'N': return 40;
    default: return 50;
  }
}

function ensureCharacterProgressionFields(char: GatchaCharacter): GatchaCharacter {
  return {
    ...char,
    level: char.level ?? 1,
    xp: char.xp ?? 0,
    maxXp: char.maxXp ?? getInitialXpForRarity(char.rarity),
  };
}









// src/contexts/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerStats, ConsumableItem, Equipment, Enemy, Currency, EquipmentSlots } from '../types/GameTypes';
import { initialPlayerStats, consumableItems, shopItems, basicEquipment } from '../data/GameData';
import { sphereGrid, SphereNode } from '../data/SphereGrid';
import { gatchaCharacters } from '../data/GatchaCharacters';

interface GameContextType {
  // --- Gatcha ---
  gatchaCharactersOwned: import('../types/GatchaTypes').GatchaCharacter[];
  team: import('../types/GatchaTypes').GatchaCharacter[];
  gatchaTickets: number;
  addGatchaTicket: (amount: number) => void;
  invokeGatchaSingle: (useTicket?: boolean) => import('../types/GatchaTypes').GatchaCharacter;
  invokeGatchaMulti: (useTicket?: boolean) => import('../types/GatchaTypes').GatchaCharacter[];
  setTeam: (team: import('../types/GatchaTypes').GatchaCharacter[]) => void;
  addCharacterToTeam: (charId: string) => void;
  removeCharacterFromTeam: (charId: string) => void;
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
  startNewGame: (playerName: string, archetype: { baseStats: PlayerStats, id?: string }) => void;
  calculateDerivedStats: (stats: PlayerStats) => PlayerStats;
  playerName: string;
  playerAvatar: string;
  sphereNodesUnlocked: string[];
  pc: number;
  gainPC: (amount: number) => void;
  unlockSphereNode: (nodeId: string) => boolean;
  showLevelUpModal: boolean;
  oldLevelStats: PlayerStats | null;
  newLevelStats: PlayerStats | null;
  closeLevelUpModal: () => void;
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
  // Sphérier : PC et nœuds débloqués
  const [pc, setPC] = useState(0);
  const [sphereNodesUnlocked, setSphereNodesUnlocked] = useState<string[]>([]);

  // ...existing code...

  // Gagner des PC
  const gainPC = (amount: number) => setPC((pc: number) => pc + amount);

  // Débloquer un nœud du sphérier
  const unlockSphereNode = (nodeId: string): boolean => {
    const node = sphereGrid.find((n: SphereNode) => n.id === nodeId);
    if (!node) return false;
    if (sphereNodesUnlocked.includes(nodeId)) return false;
    // Vérifie qu'un voisin est déjà débloqué
    const canUnlock = node.neighbors.some((n: string) => sphereNodesUnlocked.includes(n));
    if (!canUnlock) return false;
    if (pc < node.cost) return false;
    setSphereNodesUnlocked(prev => [...prev, nodeId]);
    setPC(prev => prev - node.cost);
    return true;
  };

  // Helper pour obtenir le personnage joueur principal comme GatchaCharacter-like
  function getPlayerAsCharacter(): GatchaCharacter {
    return {
      id: 'player',
      name: playerName || 'Joueur',
      rarity: 'SSR',
      sprite: playerAvatar || '🧑',
      baseStats: {
        hp: playerStats.maxHp,
        attack: playerStats.attack,
        defense: playerStats.defense,
        speed: playerStats.speed,
        magic: playerStats.magicAttack,
      },
      dupes: 0,
      unbindLevel: 0,
      level: playerStats.level,
      xp: playerStats.xp,
      maxXp: playerStats.maxXp,
      description: 'Le héros principal',
    };
  }

  // Renvoie l'équipe active pour le combat (joueur principal + équipiers)
  const getActiveTeam = (): GatchaCharacter[] => {
    // Le joueur principal est toujours en slot 0
    const filteredTeam = team.filter(c => c && c.id !== 'player');
    return [getPlayerAsCharacter(), ...filteredTeam].slice(0, 3);
  };
  // --- Gatcha ---
  const [gatchaCharactersOwned, setGatchaCharactersOwned] = useState<GatchaCharacter[]>([]);
  const [team, setTeamRaw] = useState<GatchaCharacter[]>([]); // max 3
  const [gatchaTickets, setGatchaTickets] = useState<number>(0);

  const addGatchaTicket = (amount: number) => setGatchaTickets(t => t + amount);

  // Utilitaire pour obtenir un personnage aléatoire selon la rareté (SSR: 2%, SR: 8%, R: 30%, N: 60%)
  // (import déjà en haut du fichier, à supprimer ici)
  const rollGatcha = () => {
    const rand = Math.random();
    let rarity: 'SSR' | 'SR' | 'R' | 'N';
    if (rand < 0.02) rarity = 'SSR';
    else if (rand < 0.10) rarity = 'SR';
    else if (rand < 0.40) rarity = 'R';
    else rarity = 'N';
    const pool = gatchaCharacters.filter((c: any) => c.rarity === rarity);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    return { ...chosen };
  };

  // Ajoute ou duplique un perso dans la collection du joueur
  const addGatchaCharacter = (char: GatchaCharacter) => {
    setGatchaCharactersOwned(prev => {
      const idx = prev.findIndex(c => c.id === char.id);
      if (idx >= 0) {
        // Dupe : incrémente dupes ou unbindLevel
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          dupes: updated[idx].dupes + 1,
          unbindLevel: Math.min(updated[idx].unbindLevel + 1, 5)
        };
        return updated;
      } else {
        // Ajoute le perso avec progression initialisée
        return [...prev, ensureCharacterProgressionFields({ ...char, dupes: 0, unbindLevel: 0 })];
      }
    });
  };

  // Invocation single
  const invokeGatchaSingle = (useTicket = false) => {
    if (useTicket && gatchaTickets <= 0) throw new Error('Pas assez de tickets');
    if (useTicket) setGatchaTickets(t => t - 1);
    // Sinon, on pourra décrémenter les cristaux plus tard
    const char = rollGatcha();
    addGatchaCharacter(char);
    return char;
  };

  // Invocation multi (10 pulls)
  const invokeGatchaMulti = (useTicket = false) => {
    if (useTicket && gatchaTickets < 10) throw new Error('Pas assez de tickets');
    if (useTicket) setGatchaTickets(t => t - 10);
    const results: import('../types/GatchaTypes').GatchaCharacter[] = [];
    for (let i = 0; i < 10; i++) {
      const char = rollGatcha();
      addGatchaCharacter(char);
      results.push(char);
    }
    return results;
  };

  // Gestion de l'équipe (max 3)
  const addCharacterToTeam = (charId: string) => {
    setTeamRaw(prev => {
      // On ne peut pas ajouter le joueur principal manuellement
      if (charId === 'player') return prev;
      // On limite à 2 équipiers max (slot 1 et 2)
      const filtered = prev.filter(c => c && c.id !== 'player');
      if (filtered.length >= 2) return prev;
      const char = gatchaCharactersOwned.find(c => c.id === charId);
      if (!char || filtered.some(c => c.id === charId)) return prev;
      return [...filtered, ensureCharacterProgressionFields(char)];
    });
  };
  const removeCharacterFromTeam = (charId: string) => {
    setTeamRaw(prev => prev.filter(c => c.id !== charId && c.id !== 'player'));
  };
  // Remplace l'équipe (drag & drop)
  const setTeam = (newTeam: GatchaCharacter[]) => {
    // On retire toute occurrence du joueur principal
    const filtered = newTeam.filter(c => c && c.id !== 'player');
    setTeamRaw(filtered.slice(0, 2));
  };
    // ...existing code...
  // Sphérier : PC et nœuds débloqués

  // ...existing code...
  // ...existing code...
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAvatar, setPlayerAvatar] = useState<string>('');

  // Nouvelle partie : initialise le joueur avec un archétype et un nom
  const startNewGame = (name: string, archetype: { baseStats: PlayerStats, id?: string }) => {
    // Calculer les stats dérivées à partir des stats principales
    const fullStats = calculateDerivedStats({
      ...archetype.baseStats,
      level: archetype.baseStats.level || 1,
      xp: 0,
      maxXp: 100,
      hp: 0,
      maxHp: 0,
      mp: 0,
      maxMp: 0,
      attack: 0,
      defense: 0,
      magicAttack: 0,
      magicDefense: 0,
      speed: 0,
      hitRate: 0,
      criticalRate: 0,
      evadeRate: 0,
      archetype: archetype.id || ''
    });
    setPlayerStats(fullStats);
    setInventory(consumableItems);
    setEquipment(basicEquipment);
    setEquippedItems({});
    setCurrency({ gold: 100, gems: 0 });
    setPlayerName(name);
    // Avatar selon l'archétype (import dynamique compatible Vite)
    let avatar = '';
    switch (archetype.id) {
      case 'warrior':
        avatar = new URL('../assets/avatar-warrior.png', import.meta.url).href;
        break;
      case 'mage':
        avatar = new URL('../assets/avatar-mage.png', import.meta.url).href;
        break;
      case 'thief':
        avatar = new URL('../assets/avatar-thief.png', import.meta.url).href;
        break;
      default:
        avatar = new URL('../assets/avatar.png', import.meta.url).href;
    }
    console.log('[startNewGame] playerName:', name, 'archetype:', archetype.id, 'avatar:', avatar);
    setPlayerAvatar(avatar);
    setPlayerName(name);
    // Initialise le sphérier : zone de départ selon archétype
    const startNode = sphereGrid.find((n: SphereNode) => n.archStart === archetype.id)?.id;
    setSphereNodesUnlocked(startNode ? [startNode] : []);
    setPC(0);
    // On force la sauvegarde après que les states sont bien mis à jour
    setTimeout(() => {
      saveGame();
      // Debug : log la sauvegarde juste après
      const debugSave = localStorage.getItem('questify_save');
      if (debugSave) {
        const parsed = JSON.parse(debugSave);
        console.log('[DEBUG SAVE]', parsed);
      }
    }, 50);
  };
  const [playerStats, _setPlayerStats] = useState<PlayerStats>(initialPlayerStats);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [oldLevelStats, setOldLevelStats] = useState<PlayerStats | null>(null);
  const [newLevelStats, setNewLevelStats] = useState<PlayerStats | null>(null);

  // Custom setter to detect level up
  const setPlayerStats = (updater: PlayerStats | ((prev: PlayerStats) => PlayerStats)) => {
    _setPlayerStats(prev => {
      const next = typeof updater === 'function' ? (updater as (prev: PlayerStats) => PlayerStats)(prev) : updater;
      if (next.level > prev.level) {
        setOldLevelStats(prev);
        setNewLevelStats(next);
        setShowLevelUpModal(true);
      }
      return next;
    });
  };

  const closeLevelUpModal = () => {
    setShowLevelUpModal(false);
    setOldLevelStats(null);
    setNewLevelStats(null);
  };
  const [inventory, setInventory] = useState<ConsumableItem[]>(consumableItems);
  const [equipment, setEquipment] = useState<Equipment[]>(basicEquipment);
  const [equippedItems, setEquippedItems] = useState<EquipmentSlots>({});
  const [currency, setCurrency] = useState<Currency>({ gold: 100, gems: 0 }); // Monnaie de départ
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les données sauvegardées au démarrage - une seule fois
  useEffect(() => {
    if (!isLoaded) {
      const savedData = localStorage.getItem('questify_save');
      if (savedData) {
        loadGame();
        setIsLoaded(true);
      }
      // Sinon, on laisse l'app router gérer la redirection (voir Dashboard)
    }
  }, [isLoaded]);

  // Sauvegarder automatiquement toutes les 30s
  useEffect(() => {
    if (isLoaded) {
      const autoSave = setInterval(() => {
        saveGame();
      }, 30000);
      return () => clearInterval(autoSave);
    }
  }, [isLoaded]);

  // Sauvegarde immédiate quand le nom ou l'avatar changent
  useEffect(() => {
    if (isLoaded && playerName && playerAvatar) {
      saveGame();
    }
  }, [playerName, playerAvatar, isLoaded]);

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

  const calculateDerivedStats = (stats: PlayerStats & { archetype?: string }): PlayerStats => {
    // S'assurer que toutes les stats de base sont définies
    const safeStats = {
      ...initialPlayerStats, // Commencer avec les stats par défaut
      ...stats, // Puis appliquer les stats passées en paramètre
    };

    // Détection archétype (pour scaling)
    let arch: string = '';
    if ('archetype' in safeStats && typeof (safeStats as any).archetype === 'string') {
      arch = (safeStats as any).archetype;
    } else if ((window as any).lastArchetypeId) {
      arch = (window as any).lastArchetypeId;
    }

    // Toujours partir des stats de base niveau 1 transmises (baseStats), sinon fallback sur safeStats
    let baseStats = (safeStats as any).baseStats || {
      strength: safeStats.strength,
      magic: safeStats.magic,
      vitality: safeStats.vitality,
      spirit: safeStats.spirit,
      dexterity: safeStats.dexterity,
      luck: safeStats.luck,
    };

    // Par défaut, scaling par archétype
    const level = safeStats.level || 1;
    let strength = baseStats.strength;
    let magic = baseStats.magic;
    let vitality = baseStats.vitality;
    let spirit = baseStats.spirit;
    let dexterity = baseStats.dexterity;
    let luck = baseStats.luck;

    // Appliquer une progression simple selon archétype
    if (arch === 'warrior') {
      strength += (level - 1) * 2;
      vitality += (level - 1) * 2;
      magic += (level - 1) * 1;
      spirit += (level - 1) * 1;
      dexterity += (level - 1) * 1;
      luck += (level - 1) * 1;
    } else if (arch === 'mage') {
      magic += (level - 1) * 2;
      spirit += (level - 1) * 2;
      strength += (level - 1) * 1;
      vitality += (level - 1) * 1;
      dexterity += (level - 1) * 1;
      luck += (level - 1) * 1;
    } else if (arch === 'thief') {
      dexterity += (level - 1) * 2;
      luck += (level - 1) * 2;
      strength += (level - 1) * 1;
      vitality += (level - 1) * 1;
      magic += (level - 1) * 1;
      spirit += (level - 1) * 1;
    } else {
      // Par défaut, scaling équilibré
      strength += (level - 1) * 1;
      magic += (level - 1) * 1;
      vitality += (level - 1) * 1;
      spirit += (level - 1) * 1;
      dexterity += (level - 1) * 1;
      luck += (level - 1) * 1;
    }

    const newStats = {
      ...safeStats,
      strength,
      magic,
      vitality,
      spirit,
      dexterity,
      luck,
    };

    // Calculer les stats dérivées comme dans Final Fantasy
    newStats.attack = Math.floor(newStats.strength * 2 + newStats.dexterity * 0.5);
    newStats.defense = Math.floor(newStats.vitality * 1.5 + newStats.strength * 0.2);
    newStats.magicAttack = Math.floor(newStats.magic * 2 + newStats.spirit * 0.5);
    newStats.magicDefense = Math.floor(newStats.spirit * 1.2 + newStats.magic * 0.3);
    newStats.speed = Math.floor(newStats.dexterity * 2 + newStats.luck * 0.3);
    newStats.hitRate = Math.floor(90 + newStats.dexterity * 0.5 + newStats.luck * 0.2);
    newStats.criticalRate = Math.floor(2 + newStats.luck * 0.3 + newStats.dexterity * 0.1);
    newStats.evadeRate = Math.floor(2 + newStats.dexterity * 0.3 + newStats.luck * 0.4);

    // Calculer HP et MP maximaux
    newStats.maxHp = Math.floor(100 + newStats.vitality * 8 + level * 10);
    newStats.maxMp = Math.floor(20 + newStats.spirit * 4 + newStats.magic * 2 + level * 3);

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
      playerAvatar,
      playerName,
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
        if (gameData.playerAvatar) setPlayerAvatar(gameData.playerAvatar);
        if (gameData.playerName) setPlayerName(gameData.playerName);
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

  // -- méthodes sphérier doivent être déclarées avant value --
  const value: GameContextType & { getActiveTeam: () => GatchaCharacter[] } = {
    gatchaCharactersOwned,
    team,
    gatchaTickets,
    addGatchaTicket,
    invokeGatchaSingle,
    invokeGatchaMulti,
    setTeam,
    addCharacterToTeam,
    removeCharacterFromTeam,
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
    buyItem,
    startNewGame,
    calculateDerivedStats,
    playerName,
    playerAvatar,
    sphereNodesUnlocked,
    pc,
    gainPC,
    unlockSphereNode,
    showLevelUpModal,
    oldLevelStats,
    newLevelStats,
    closeLevelUpModal,
    getActiveTeam
  };


  // Helper pour debug : simuler un gain de niveau depuis la console
  React.useEffect(() => {
    (window as any).simulateLevelUp = () => {
      setPlayerStats((prev: any) => {
        const newLevel = prev.level + 1;
        const newStats = calculateDerivedStats({
          ...prev,
          level: newLevel,
          xp: 0,
          maxXp: newLevel * 100,
        });
        return newStats;
      });
      // (Plus d'alert, la modale RPG s'affichera automatiquement)
    };
  }, [setPlayerStats, calculateDerivedStats]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
