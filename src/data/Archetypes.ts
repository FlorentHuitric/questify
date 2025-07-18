// src/data/Archetypes.ts
import { PlayerStats } from '../types/GameTypes';


export type Archetype = {
  id: string;
  name: string;
  description: string;
  baseStats: {
    strength: number;
    magic: number;
    vitality: number;
    spirit: number;
    dexterity: number;
    luck: number;
  };
};

export const archetypes: Archetype[] = [
  {
    id: 'warrior',
    name: 'Guerrier',
    description: 'Un combattant robuste, spécialisé dans la force et la vitalité.',
    baseStats: {
      strength: 12,
      magic: 4,
      vitality: 13,
      spirit: 6,
      dexterity: 7,
      luck: 4,
    },
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'Maître des arcanes, excelle en magie et esprit.',
    baseStats: {
      strength: 4,
      magic: 13,
      vitality: 5,
      spirit: 12,
      dexterity: 6,
      luck: 5,
    },
  },
  {
    id: 'thief',
    name: 'Voleur',
    description: 'Rapide et agile, excelle en dextérité et chance.',
    baseStats: {
      strength: 7,
      magic: 4,
      vitality: 7,
      spirit: 6,
      dexterity: 13,
      luck: 11,
    },
  },
  // Ajoutez d'autres archétypes ici si besoin
];
