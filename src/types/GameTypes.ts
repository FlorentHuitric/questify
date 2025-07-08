// src/types/GameTypes.ts
export interface PlayerStats {
  level: number;
  xp: number;
  maxXp: number;
  strength: number;
  agility: number;
  wisdom: number;
  constitution: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  strength: number;
  agility: number;
  xpReward: number;
  goldReward: number;
  sprite: string;
}

export interface MapZone {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  unlocked: boolean;
  enemies: Enemy[];
  backgroundImage: string;
  position: { x: number; y: number };
}

export interface CombatResult {
  victory: boolean;
  xpGained: number;
  goldGained: number;
  damageDealt: number;
  damageTaken: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  strengthBonus: number;
  agilityBonus: number;
  wisdomBonus: number;
  constitutionBonus: number;
  sprite: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'main' | 'side';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  goldReward: number;
  requirements: string[];
  progress: number;
  maxProgress: number;
  completed: boolean;
  deadline?: Date;
}

// Combat System Types
export interface CombatAction {
  type: 'attack' | 'magic' | 'defend' | 'item' | 'flee';
  name: string;
  mpCost?: number;
  damage?: number;
  healAmount?: number;
  accuracy: number;
  description: string;
}

export interface Spell {
  id: string;
  name: string;
  mpCost: number;
  damage?: number;
  healAmount?: number;
  type: 'offensive' | 'defensive' | 'healing';
  element: 'fire' | 'ice' | 'lightning' | 'earth' | 'holy' | 'dark' | 'none';
  description: string;
  requiredLevel: number;
}

export interface CombatTurn {
  actor: 'player' | 'enemy';
  action: CombatAction;
  target: 'player' | 'enemy';
  damage?: number;
  critical?: boolean;
  missed?: boolean;
}

export interface CombatState {
  phase: 'preparation' | 'action-selection' | 'executing' | 'victory' | 'defeat';
  playerStats: PlayerStats;
  enemy: Enemy;
  turnOrder: ('player' | 'enemy')[];
  currentTurn: number;
  combatLog: CombatTurn[];
  playerDefending: boolean;
  enemyDefending: boolean;
}

// Currency System
export interface Currency {
  gold: number;
  gems: number; // Premium currency
}

// Shop System
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  premiumPrice?: number;
  category: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'spell';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats?: Partial<PlayerStats>;
  sprite: string;
  levelRequired: number;
}

export interface Inventory {
  equipment: Equipment[];
  consumables: ConsumableItem[];
  spells: Spell[];
  maxSlots: number;
}

export interface ConsumableItem {
  id: string;
  name: string;
  description: string;
  effect: 'heal' | 'mp-restore' | 'boost-strength' | 'boost-agility' | 'boost-wisdom';
  value: number;
  quantity: number;
  sprite: string;
}

// Player progression
export interface PlayerClass {
  id: string;
  name: string;
  description: string;
  baseStats: Partial<PlayerStats>;
  spellTree: Spell[];
  equipmentTypes: string[];
  sprite: string;
}

export interface GameState {
  player: PlayerStats;
  playerClass: PlayerClass;
  currency: Currency;
  inventory: Inventory;
  equippedItems: {
    weapon?: Equipment;
    armor?: Equipment;
    accessory?: Equipment;
  };
  unlockedZones: string[];
  completedQuests: string[];
  currentLocation?: string;
}
