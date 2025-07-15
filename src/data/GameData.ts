// src/data/GameData.ts
import { PlayerStats, Enemy, MapZone, Equipment, ConsumableItem, Inventory, ShopItem } from '../types/GameTypes';

export const initialPlayerStats: PlayerStats = {
  level: 1,
  xp: 0,
  maxXp: 100,
  // Stats principales (1-99 comme FF)
  strength: 12,      // Force de base
  magic: 8,          // Magie de base
  vitality: 15,      // Vitalité de base
  spirit: 10,        // Esprit de base
  dexterity: 11,     // Dextérité de base
  luck: 7,           // Chance de base
  // Stats dérivées (calculées)
  attack: 24,        // Force * 2
  defense: 10,       // Vitalité / 1.5
  magicAttack: 16,   // Magie * 2
  magicDefense: 8,   // Esprit * 0.8
  speed: 22,         // Dextérité * 2
  hitRate: 95,       // Base 90 + dextérité/2
  criticalRate: 3,   // Base 2 + chance/5
  evadeRate: 5,      // Base 2 + dextérité/4
  // Santé et mana (valeurs FF)
  hp: 120,
  maxHp: 120,
  mp: 45,
  maxMp: 45
};

export const enemies: Enemy[] = [
  {
    id: 'slime',
    name: 'Slime Paresseux',
    level: 1,
    hp: 25,
    maxHp: 25,
    strength: 5,
    agility: 3,
    xpReward: 15,
    goldReward: 10,
    sprite: '🟢'
  },
  {
    id: 'procrastination',
    name: 'Démon de Procrastination',
    level: 3,
    hp: 60,
    maxHp: 60,
    strength: 12,
    agility: 8,
    xpReward: 35,
    goldReward: 25,
    sprite: '😈'
  },
  {
    id: 'stress',
    name: 'Gardien du Stress',
    level: 5,
    hp: 100,
    maxHp: 100,
    strength: 18,
    agility: 15,
    xpReward: 75,
    goldReward: 50,
    sprite: '💀'
  }
];

export const mapZones: MapZone[] = [
  {
    id: 'forest',
    name: 'Forêt des Habitudes',
    description: 'Un lieu paisible pour commencer votre aventure',
    requiredLevel: 1,
    unlocked: true,
    enemies: [enemies[0]],
    backgroundImage: '🌲',
    position: { x: 100, y: 150 }
  },
  {
    id: 'mountain',
    name: 'Montagne des Défis',
    description: 'Des défis plus difficiles vous attendent',
    requiredLevel: 3,
    unlocked: false,
    enemies: [enemies[1]],
    backgroundImage: '⛰️',
    position: { x: 250, y: 100 }
  },
  {
    id: 'castle',
    name: 'Château du Stress',
    description: 'Le boss final vous attend !',
    requiredLevel: 5,
    unlocked: false,
    enemies: [enemies[2]],
    backgroundImage: '🏰',
    position: { x: 400, y: 80 }
  }
];

// Ancienne section d'équipements supprimée - remplacée par basicEquipment

export const consumableItems: ConsumableItem[] = [
  {
    id: 'health_potion',
    name: 'Potion de Soin',
    description: 'Restaure 30 PV',
    effect: 'heal',
    value: 30,
    quantity: 3,
    sprite: '🧪'
  },
  {
    id: 'mana_potion',
    name: 'Potion de Mana',
    description: 'Restaure 20 PM',
    effect: 'mp-restore',
    value: 20,
    quantity: 2,
    sprite: '🔮'
  },
  {
    id: 'strength_boost',
    name: 'Élixir de Force',
    description: 'Augmente la force de 5 pour le combat',
    effect: 'boost-strength',
    value: 5,
    quantity: 1,
    sprite: '⚡'
  },
  {
    id: 'agility_boost',
    name: 'Potion d\'Agilité',
    description: 'Augmente l\'agilité de 3 pour le combat',
    effect: 'boost-agility',
    value: 3,
    quantity: 1,
    sprite: '🌪️'
  },
  {
    id: 'wisdom_boost',
    name: 'Potion de Sagesse',
    description: 'Augmente la sagesse de 4 pour le combat',
    effect: 'boost-wisdom',
    value: 4,
    quantity: 1,
    sprite: '🧠'
  }
];

export const initialInventory: Inventory = {
  equipment: [], // Équipement vide par défaut (utilise basicEquipment maintenant)
  consumables: consumableItems,
  spells: [],
  maxSlots: 20
};

export const shopItems: ShopItem[] = [
  // Armes
  {
    id: 'iron-sword',
    name: 'Épée de Fer',
    description: 'Une épée basique mais efficace. +18 Attaque',
    price: 150,
    category: 'weapon',
    rarity: 'common',
    stats: { strength: 5, attack: 18 },
    sprite: '⚔️',
    levelRequired: 1
  },
  {
    id: 'steel-sword',
    name: 'Épée d\'Acier',
    description: 'Une épée plus solide et tranchante. +35 Attaque',
    price: 450,
    category: 'weapon',
    rarity: 'rare',
    stats: { strength: 12, dexterity: 2, attack: 35 },
    sprite: '🗡️',
    levelRequired: 5
  },
  {
    id: 'flame-sword',
    name: 'Épée de Flamme',
    description: 'Une épée enchantée avec le pouvoir du feu. +55 Attaque, +12 Att.Mag',
    price: 1200,
    premiumPrice: 15,
    category: 'weapon',
    rarity: 'epic',
    stats: { strength: 20, magic: 5, attack: 55, magicAttack: 12 },
    sprite: '🔥',
    levelRequired: 10
  },
  // Armures
  {
    id: 'leather-armor',
    name: 'Armure de Cuir',
    description: 'Protection basique mais flexible. +22 Défense',
    price: 120,
    category: 'armor',
    rarity: 'common',
    stats: { vitality: 3, dexterity: 2, defense: 22, speed: 4 },
    sprite: '🛡️',
    levelRequired: 1
  },
  {
    id: 'chain-mail',
    name: 'Cotte de Mailles',
    description: 'Armure métallique résistante. +45 Défense',
    price: 380,
    category: 'armor',
    rarity: 'rare',
    stats: { vitality: 8, strength: 2, defense: 45, hp: 35 },
    sprite: '🛡️',
    levelRequired: 4
  },
  {
    id: 'dragon-scale',
    name: 'Écailles de Dragon',
    description: 'Armure légendaire faite d\'écailles de dragon',
    price: 1500,
    premiumPrice: 25,
    category: 'armor',
    rarity: 'legendary',
    stats: { vitality: 15, strength: 5, magic: 3, defense: 85, hp: 80 },
    sprite: '🐉',
    levelRequired: 15
  },
  // Accessoires
  {
    id: 'power-ring',
    name: 'Anneau de Puissance',
    description: 'Augmente la force physique',
    price: 200,
    category: 'accessory',
    rarity: 'rare',
    stats: { strength: 8 },
    sprite: '💍',
    levelRequired: 3
  },
  {
    id: 'wisdom-amulet',
    name: 'Amulette de Sagesse',
    description: 'Améliore les capacités magiques',
    price: 350,
    premiumPrice: 8,
    category: 'accessory',
    rarity: 'epic',
    stats: { magic: 12, spirit: 8, magicAttack: 24, mp: 30 },
    sprite: '🔮',
    levelRequired: 6
  },
  // Consommables
  {
    id: 'health_potion',
    name: 'Potion de Soin',
    description: 'Restaure 30 PV',
    price: 25,
    category: 'consumable',
    rarity: 'common',
    sprite: '🧪',
    levelRequired: 1
  },
  {
    id: 'mana_potion',
    name: 'Potion de Mana',
    description: 'Restaure 20 PM',
    price: 35,
    category: 'consumable',
    rarity: 'common',
    sprite: '�',
    levelRequired: 1
  },
  {
    id: 'premium-boost',
    name: 'Boost Premium',
    description: 'Double l\'XP pendant 24h',
    price: 0,
    premiumPrice: 10,
    category: 'consumable',
    rarity: 'epic',
    sprite: '⭐',
    levelRequired: 1
  }
];

// Équipements de base
export const basicEquipment: Equipment[] = [
  {
    id: 'starter-sword',
    name: 'Épée de Débutant',
    type: 'weapon',
    slot: 'weapon',
    strengthBonus: 3,
    magicBonus: 0,
    vitalityBonus: 0,
    spiritBonus: 0,
    dexterityBonus: 1,
    luckBonus: 0,
    attackBonus: 12,
    defenseBonus: 0,
    magicAttackBonus: 0,
    magicDefenseBonus: 0,
    speedBonus: 2,
    hitRateBonus: 5,
    criticalRateBonus: 1,
    evadeRateBonus: 0,
    sprite: '⚔️',
    rarity: 'common',
    levelRequired: 1,
    description: 'Une épée simple mais efficace pour débuter. +12 Attaque'
  },
  {
    id: 'leather-helmet',
    name: 'Casque de Cuir',
    type: 'helmet',
    slot: 'helmet',
    strengthBonus: 0,
    magicBonus: 0,
    vitalityBonus: 2,
    spiritBonus: 1,
    dexterityBonus: 0,
    luckBonus: 0,
    attackBonus: 0,
    defenseBonus: 8,
    magicAttackBonus: 0,
    magicDefenseBonus: 4,
    speedBonus: 0,
    hitRateBonus: 0,
    criticalRateBonus: 0,
    evadeRateBonus: 0,
    hpBonus: 15,
    sprite: '🪖',
    rarity: 'common',
    levelRequired: 1,
    description: 'Protection basique pour la tête. +8 Défense, +15 PV'
  },
  {
    id: 'basic-armor',
    name: 'Armure de Cuir',
    type: 'armor',
    slot: 'armor',
    strengthBonus: 0,
    magicBonus: 0,
    vitalityBonus: 4,
    spiritBonus: 1,
    dexterityBonus: -1,
    luckBonus: 0,
    attackBonus: 0,
    defenseBonus: 18,
    magicAttackBonus: 0,
    magicDefenseBonus: 6,
    speedBonus: -2,
    hitRateBonus: 0,
    criticalRateBonus: 0,
    evadeRateBonus: -1,
    hpBonus: 25,
    sprite: '🛡️',
    rarity: 'common',
    levelRequired: 1,
    description: 'Armure légère mais résistante. +18 Défense, +25 PV'
  },
  {
    id: 'leather-boots',
    name: 'Bottes de Cuir',
    type: 'boots',
    slot: 'boots',
    strengthBonus: 0,
    magicBonus: 0,
    vitalityBonus: 1,
    spiritBonus: 0,
    dexterityBonus: 3,
    luckBonus: 1,
    attackBonus: 0,
    defenseBonus: 3,
    magicAttackBonus: 0,
    magicDefenseBonus: 0,
    speedBonus: 6,
    hitRateBonus: 2,
    criticalRateBonus: 0,
    evadeRateBonus: 3,
    hpBonus: 10,
    sprite: '👢',
    rarity: 'common',
    levelRequired: 1,
    description: 'Bottes confortables pour les aventures. +6 Vitesse, +3 Esquive'
  },
  {
    id: 'cloth-gloves',
    name: 'Gants de Tissu',
    type: 'gloves',
    slot: 'gloves',
    strengthBonus: 1,
    magicBonus: 0,
    vitalityBonus: 0,
    spiritBonus: 0,
    dexterityBonus: 2,
    luckBonus: 0,
    attackBonus: 2,
    defenseBonus: 2,
    magicAttackBonus: 0,
    magicDefenseBonus: 0,
    speedBonus: 4,
    hitRateBonus: 3,
    criticalRateBonus: 0,
    evadeRateBonus: 1,
    sprite: '🧤',
    rarity: 'common',
    levelRequired: 1,
    description: 'Gants légers pour une meilleure dextérité. +3 Précision'
  },
  {
    id: 'bronze-ring',
    name: 'Anneau de Bronze',
    type: 'ring',
    slot: 'ring1',
    strengthBonus: 2,
    magicBonus: 1,
    vitalityBonus: 0,
    spiritBonus: 0,
    dexterityBonus: 0,
    luckBonus: 1,
    attackBonus: 4,
    defenseBonus: 0,
    magicAttackBonus: 2,
    magicDefenseBonus: 0,
    speedBonus: 0,
    hitRateBonus: 0,
    criticalRateBonus: 1,
    evadeRateBonus: 0,
    sprite: '💍',
    rarity: 'common',
    levelRequired: 1,
    description: 'Un simple anneau de bronze. +4 Attaque, +1 Critique'
  },
  {
    id: 'wooden-shield',
    name: 'Bouclier de Bois',
    type: 'shield',
    slot: 'shield',
    strengthBonus: 0,
    magicBonus: 0,
    vitalityBonus: 4,
    spiritBonus: 0,
    dexterityBonus: -1,
    luckBonus: 0,
    attackBonus: 0,
    defenseBonus: 15,
    magicAttackBonus: 0,
    magicDefenseBonus: 5,
    speedBonus: -2,
    hitRateBonus: 0,
    criticalRateBonus: 0,
    evadeRateBonus: -2,
    hpBonus: 20,
    sprite: '🛡️',
    rarity: 'common',
    levelRequired: 1,
    description: 'Bouclier basique en bois renforcé. +15 Défense, +20 PV'
  },
  {
    id: 'magic-amulet',
    name: 'Amulette Magique',
    type: 'amulet',
    slot: 'amulet',
    strengthBonus: 0,
    magicBonus: 4,
    vitalityBonus: 0,
    spiritBonus: 3,
    dexterityBonus: 0,
    luckBonus: 0,
    attackBonus: 0,
    defenseBonus: 0,
    magicAttackBonus: 8,
    magicDefenseBonus: 6,
    speedBonus: 0,
    hitRateBonus: 0,
    criticalRateBonus: 0,
    evadeRateBonus: 0,
    mpBonus: 20,
    sprite: '🔮',
    rarity: 'rare',
    levelRequired: 3,
    description: 'Amulette qui augmente les capacités magiques. +8 Att.Mag, +20 PM'
  }
];
