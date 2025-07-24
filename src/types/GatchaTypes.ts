// Types pour le système de gatcha et les personnages

export type GatchaRarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR';

export interface GatchaCharacter {
  id: string;
  name: string;
  rarity: GatchaRarity;
  sprite: string; // chemin ou emoji temporaire
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    magic: number;
  };
  dupes: number; // nombre de doublons possédés
  unbindLevel: number; // niveau de débridage (max 5)
  level: number; // niveau du personnage
  xp: number; // expérience actuelle
  maxXp: number; // xp nécessaire pour le prochain niveau
  description?: string;
}
