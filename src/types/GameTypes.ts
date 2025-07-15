// src/types/GameTypes.ts
export interface PlayerStats {
  level: number;
  xp: number;
  maxXp: number;
  // Stats principales (comme FF)
  strength: number;      // Force (attaque physique)
  magic: number;         // Magie (attaque magique)
  vitality: number;      // Vitalité (PV et résistance)
  spirit: number;        // Esprit (PM et résistance magique)
  dexterity: number;     // Dextérité (vitesse et précision)
  luck: number;          // Chance (critiques et esquive)
  // Stats dérivées
  attack: number;        // Attaque physique totale
  defense: number;       // Défense physique
  magicAttack: number;   // Attaque magique totale
  magicDefense: number;  // Défense magique
  speed: number;         // Vitesse (ordre des tours)
  hitRate: number;       // Précision (%)
  criticalRate: number;  // Taux de critique (%)
  evadeRate: number;     // Taux d'esquive (%)
  // Santé et mana
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
  type: 'weapon' | 'helmet' | 'armor' | 'boots' | 'gloves' | 'ring' | 'amulet' | 'shield';
  slot: 'weapon' | 'helmet' | 'armor' | 'boots' | 'gloves' | 'ring1' | 'ring2' | 'amulet' | 'shield';
  // Stats principales
  strengthBonus: number;
  magicBonus: number;
  vitalityBonus: number;
  spiritBonus: number;
  dexterityBonus: number;
  luckBonus: number;
  // Stats dérivées
  attackBonus: number;
  defenseBonus: number;
  magicAttackBonus: number;
  magicDefenseBonus: number;
  speedBonus: number;
  hitRateBonus: number;
  criticalRateBonus: number;
  evadeRateBonus: number;
  // Santé et mana
  hpBonus?: number;
  mpBonus?: number;
  sprite: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  levelRequired: number;
  description: string;
}

export interface EquipmentSlots {
  weapon?: Equipment;
  helmet?: Equipment;
  armor?: Equipment;
  boots?: Equipment;
  gloves?: Equipment;
  ring1?: Equipment;
  ring2?: Equipment;
  amulet?: Equipment;
  shield?: Equipment;
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
  equippedItems: EquipmentSlots;
  unlockedZones: string[];
  completedQuests: string[];
  currentLocation?: string;
}
