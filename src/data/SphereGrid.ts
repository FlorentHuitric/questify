// src/data/SphereGrid.ts
import { PlayerStats } from '../types/GameTypes';

export type SphereNode = {
  id: string;
  label: string;
  type: 'stat' | 'skill' | 'passive';
  effect: { stat?: keyof PlayerStats; value?: number; skillId?: string; passiveId?: string };
  cost: number;
  neighbors: string[];
  archStart?: 'warrior' | 'mage' | 'thief';
};

export const sphereGrid: SphereNode[] = [
  // Guerrier
  { id: 'w1', label: 'Force +2', type: 'stat', effect: { stat: 'strength', value: 2 }, cost: 2, neighbors: ['w2'], archStart: 'warrior' },
  { id: 'w2', label: 'PV +20', type: 'stat', effect: { stat: 'maxHp', value: 20 }, cost: 2, neighbors: ['w1', 'c1'] },
  // Mage
  { id: 'm1', label: 'Magie +2', type: 'stat', effect: { stat: 'magic', value: 2 }, cost: 2, neighbors: ['m2'], archStart: 'mage' },
  { id: 'm2', label: 'PM +10', type: 'stat', effect: { stat: 'maxMp', value: 10 }, cost: 2, neighbors: ['m1', 'c1'] },
  // Voleur
  { id: 't1', label: 'Dextérité +2', type: 'stat', effect: { stat: 'dexterity', value: 2 }, cost: 2, neighbors: ['t2'], archStart: 'thief' },
  { id: 't2', label: 'Esquive +1%', type: 'stat', effect: { stat: 'evadeRate', value: 1 }, cost: 2, neighbors: ['t1', 'c1'] },
  // Nœud central
  { id: 'c1', label: 'Compétence: Soin', type: 'skill', effect: { skillId: 'heal' }, cost: 4, neighbors: ['w2', 'm2', 't2', 'c2'] },
  // Suite de l'arbre (exemple)
  { id: 'c2', label: 'Force +1', type: 'stat', effect: { stat: 'strength', value: 1 }, cost: 2, neighbors: ['c1', 'c3'] },
  { id: 'c3', label: 'Compétence: Frappe rapide', type: 'skill', effect: { skillId: 'quick-strike' }, cost: 5, neighbors: ['c2'] },
];
