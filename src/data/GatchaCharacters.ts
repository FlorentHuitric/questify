// Liste de personnages gatcha disponibles
import { GatchaCharacter } from '../types/GatchaTypes';

export const gatchaCharacters: GatchaCharacter[] = [
  {
    id: 'heroine',
    name: 'Alyra',
    rarity: 'SSR',
    sprite: '🦸‍♀️',
    baseStats: { hp: 1200, attack: 180, defense: 90, speed: 110, magic: 160 },
    dupes: 0,
    unbindLevel: 0,
    level: 1,
    xp: 0,
    maxXp: 100,
    description: 'La magicienne légendaire du royaume.'
  },
  {
    id: 'knight',
    name: 'Sir Roland',
    rarity: 'SR',
    sprite: '🛡️',
    baseStats: { hp: 1500, attack: 120, defense: 160, speed: 80, magic: 60 },
    dupes: 0,
    unbindLevel: 0,
    level: 1,
    xp: 0,
    maxXp: 100,
    description: 'Chevalier loyal et défenseur du peuple.'
  },
  {
    id: 'thief',
    name: 'Vix',
    rarity: 'R',
    sprite: '🗡️',
    baseStats: { hp: 900, attack: 140, defense: 70, speed: 150, magic: 40 },
    dupes: 0,
    unbindLevel: 0,
    level: 1,
    xp: 0,
    maxXp: 100,
    description: 'Voleur agile et insaisissable.'
  },
  {
    id: 'healer',
    name: 'Mira',
    rarity: 'SR',
    sprite: '💖',
    baseStats: { hp: 1100, attack: 70, defense: 100, speed: 120, magic: 180 },
    dupes: 0,
    unbindLevel: 0,
    level: 1,
    xp: 0,
    maxXp: 100,
    description: 'Prêtresse guérisseuse au grand cœur.'
  },
  {
    id: 'slime',
    name: 'Slime Bleu',
    rarity: 'N',
    sprite: '🟦',
    baseStats: { hp: 500, attack: 40, defense: 30, speed: 60, magic: 10 },
    dupes: 0,
    unbindLevel: 0,
    level: 1,
    xp: 0,
    maxXp: 100,
    description: 'Un slime tout mignon, mais pas très fort.'
  },
  // ...ajouter d'autres persos pour la diversité
];
