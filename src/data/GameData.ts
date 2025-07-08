// src/data/GameData.ts
import { PlayerStats, Enemy, MapZone, Equipment, ConsumableItem, Inventory, ShopItem } from '../types/GameTypes';

export const initialPlayerStats: PlayerStats = {
  level: 1,
  xp: 0,
  maxXp: 100,
  strength: 10,
  agility: 8,
  wisdom: 12,
  constitution: 9,
  hp: 50,
  maxHp: 50,
  mp: 20,
  maxMp: 20
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

export const equipment: Equipment[] = [
  {
    id: 'wooden_sword',
    name: 'Épée en Bois',
    type: 'weapon',
    strengthBonus: 2,
    agilityBonus: 0,
    wisdomBonus: 0,
    constitutionBonus: 0,
    sprite: '⚔️'
  },
  {
    id: 'leather_armor',
    name: 'Armure en Cuir',
    type: 'armor',
    strengthBonus: 0,
    agilityBonus: 1,
    wisdomBonus: 0,
    constitutionBonus: 3,
    sprite: '🛡️'
  },
  {
    id: 'wisdom_ring',
    name: 'Anneau de Sagesse',
    type: 'accessory',
    strengthBonus: 0,
    agilityBonus: 0,
    wisdomBonus: 5,
    constitutionBonus: 0,
    sprite: '💍'
  }
];

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
  equipment: [equipment[0]], // Épée en bois par défaut
  consumables: consumableItems,
  spells: [],
  maxSlots: 20
};

export const shopItems: ShopItem[] = [
  // Armes
  {
    id: 'iron-sword',
    name: 'Épée de Fer',
    description: 'Une épée basique mais efficace',
    price: 100,
    category: 'weapon',
    rarity: 'common',
    stats: { strength: 5 },
    sprite: '⚔️',
    levelRequired: 1
  },
  {
    id: 'steel-sword',
    name: 'Épée d\'Acier',
    description: 'Une épée plus solide et tranchante',
    price: 300,
    category: 'weapon',
    rarity: 'rare',
    stats: { strength: 12 },
    sprite: '🗡️',
    levelRequired: 5
  },
  {
    id: 'flame-sword',
    name: 'Épée de Flamme',
    description: 'Une épée enchantée avec le pouvoir du feu',
    price: 800,
    premiumPrice: 15,
    category: 'weapon',
    rarity: 'epic',
    stats: { strength: 20, wisdom: 5 },
    sprite: '🔥',
    levelRequired: 10
  },
  // Armures
  {
    id: 'leather-armor',
    name: 'Armure de Cuir',
    description: 'Protection basique mais flexible',
    price: 80,
    category: 'armor',
    rarity: 'common',
    stats: { constitution: 3, agility: 2 },
    sprite: '🛡️',
    levelRequired: 1
  },
  {
    id: 'chain-mail',
    name: 'Cotte de Mailles',
    description: 'Armure métallique résistante',
    price: 250,
    category: 'armor',
    rarity: 'rare',
    stats: { constitution: 8, strength: 2 },
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
    stats: { constitution: 15, strength: 5, wisdom: 3 },
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
    stats: { wisdom: 12, mp: 20 },
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
