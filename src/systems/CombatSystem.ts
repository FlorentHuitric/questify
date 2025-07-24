// src/systems/CombatSystem.ts
import { PlayerStats, Enemy, CombatState, CombatAction, CombatTurn } from '../types/GameTypes';
import { GatchaCharacter } from '../types/GatchaTypes';

export class CombatSystem {
  private state: CombatState & {
    allies: GatchaCharacter[];
    activeAllyIndex: number;
  };

  constructor(allies: GatchaCharacter[], enemy: Enemy) {
    this.state = {
      phase: 'preparation',
      // Pour compatibilité, on garde playerStats = stats du premier allié
      playerStats: { ...this.gatchaToPlayerStats(allies[0]) },
      enemy: { ...enemy },
      turnOrder: this.calculateTurnOrder(allies, enemy),
      currentTurn: 0,
      combatLog: [],
      playerDefending: false,
      enemyDefending: false,
      allies: allies.map(a => ({ ...a })),
      activeAllyIndex: 0,
    };
  }

  // Convertit un GatchaCharacter en PlayerStats pour compatibilité
  private gatchaToPlayerStats(char: GatchaCharacter): PlayerStats {
    return {
      level: char.level,
      xp: char.xp,
      maxXp: char.maxXp,
      strength: char.baseStats.attack, // mapping simplifié
      magic: char.baseStats.magic,
      vitality: char.baseStats.defense,
      spirit: 10, // à adapter si besoin
      dexterity: char.baseStats.speed,
      luck: 10, // à adapter si besoin
      attack: char.baseStats.attack,
      defense: char.baseStats.defense,
      magicAttack: char.baseStats.magic,
      magicDefense: 10, // à adapter
      speed: char.baseStats.speed,
      hitRate: 95,
      criticalRate: 5,
      evadeRate: 5,
      hp: char.baseStats.hp,
      maxHp: char.baseStats.hp,
      mp: 30,
      maxMp: 30,
    };
  }

  private calculateTurnOrder(allies: GatchaCharacter[], enemy: Enemy): (string | 'enemy')[] {
    // Timeline FFX : chaque allié et l'ennemi ont leur propre CT
    const speeds = [
      ...allies.map(a => ({ id: a.id, speed: a.baseStats.speed })),
      { id: 'enemy', speed: enemy.agility || 20 }
    ];
    const cts = speeds.map(() => 0);
    const order: (string | 'enemy')[] = [];
    for (let i = 0; i < 50; i++) {
      speeds.forEach((actor, idx) => {
        cts[idx] += actor.speed;
      });
      // Qui a le plus haut CT >= 100 ?
      let maxCT = Math.max(...cts);
      let readyIdxs = cts.map((ct, idx) => ct >= 100 ? idx : -1).filter(idx => idx !== -1);
      if (readyIdxs.length > 0) {
        // Si plusieurs, priorité à la plus grande vitesse
        let chosenIdx = readyIdxs[0];
        if (readyIdxs.length > 1) {
          chosenIdx = readyIdxs.reduce((best, idx) => speeds[idx].speed > speeds[best].speed ? idx : best, readyIdxs[0]);
        }
        order.push(speeds[chosenIdx].id);
        cts[chosenIdx] -= 100;
      }
    }
    return order;
  }

  public getCurrentActor(): string | 'enemy' {
    return this.state.turnOrder[this.state.currentTurn % this.state.turnOrder.length];
  }

  public getState(): CombatState & { allies: GatchaCharacter[], activeAllyIndex: number } {
    return { ...this.state };
  }

  public executePlayerAction(action: CombatAction): CombatTurn {
    // Qui agit ?
    const actorId = this.getCurrentActor();
    const allyIdx = this.state.allies.findIndex(a => a.id === actorId);
    const actingAlly = this.state.allies[allyIdx];
    const stats = this.gatchaToPlayerStats(actingAlly);
    const turn: CombatTurn = {
      actor: actorId,
      action,
      target: 'enemy'
    };

    switch (action.type) {
      case 'attack':
        turn.damage = this.calculatePhysicalDamage(stats);
        turn.critical = Math.random() < (stats.criticalRate / 100);
        turn.missed = Math.random() > (stats.hitRate / 100);
        if (!turn.missed) {
          const finalDamage = turn.critical ? turn.damage * 2 : turn.damage;
          if (this.state.enemyDefending) {
            turn.damage = Math.floor(finalDamage * 0.5);
          } else {
            turn.damage = finalDamage;
          }
          this.state.enemy.hp = Math.max(0, this.state.enemy.hp - turn.damage);
        }
        break;
      case 'magic':
        if (stats.mp >= (action.mpCost || 0)) {
          turn.damage = this.calculateMagicalDamage(stats);
          turn.missed = Math.random() > action.accuracy;
          if (!turn.missed) {
            const finalDamage = this.state.enemyDefending ? Math.floor(turn.damage * 0.7) : turn.damage;
            this.state.enemy.hp = Math.max(0, this.state.enemy.hp - finalDamage);
            // Consommer le MP sur l'allié
            // (à implémenter si on veut gérer le MP de chaque allié)
          }
        }
        break;
      case 'defend':
        this.state.playerDefending = true;
        break;
      case 'flee':
        const fleeChance = Math.min(0.8, stats.speed / (stats.speed + (this.state.enemy.agility || 20)));
        if (Math.random() < fleeChance) {
          this.state.phase = 'defeat';
          return { ...turn, missed: false };
        } else {
          turn.missed = true;
        }
        break;
    }
    this.state.combatLog.push(turn);
    this.nextTurn();
    return turn;
  }

  public executeEnemyAction(): CombatTurn {
    // IA simple pour l'ennemi
    const actions = ['attack', 'defend'] as const;
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    const action: CombatAction = {
      type: randomAction,
      name: randomAction === 'attack' ? 'Attaque' : 'Défense',
      accuracy: 0.8,
      description: ''
    };

    // Cible aléatoire parmi les alliés vivants
    const livingAllies = this.state.allies.filter(a => a.baseStats.hp > 0);
    const target = livingAllies[Math.floor(Math.random() * livingAllies.length)];
    const turn: CombatTurn = {
      actor: 'enemy',
      action,
      target: target ? target.id : 'player'
    };

    switch (randomAction) {
      case 'attack':
        turn.damage = this.calculateEnemyDamage(this.state.enemy, this.gatchaToPlayerStats(target));
        turn.critical = Math.random() < 0.05;
        turn.missed = Math.random() > action.accuracy;
        if (!turn.missed) {
          const finalDamage = turn.critical ? turn.damage * 2 : turn.damage;
          // Appliquer les dégâts à la cible
          const idx = this.state.allies.findIndex(a => a.id === target.id);
          if (idx !== -1) {
            this.state.allies[idx].baseStats.hp = Math.max(0, this.state.allies[idx].baseStats.hp - finalDamage);
          }
        }
        break;
      case 'defend':
        this.state.enemyDefending = true;
        break;
    }
    this.state.combatLog.push(turn);
    this.nextTurn();
    return turn;
  }

  private calculateEnemyDamage(enemy: Enemy, player: PlayerStats): number {
    // Calcul des dégâts ennemis vs défense du joueur
    const baseDamage = Math.floor(enemy.strength * 1.5 + Math.random() * enemy.strength * 0.5);
    const playerDefense = player.defense || Math.floor(player.vitality * 1.5);
    return Math.max(1, baseDamage - Math.floor(playerDefense * 0.5));
  }

  private calculatePhysicalDamage(player: PlayerStats): number {
    // Formule style Final Fantasy: Attaque - Défense ennemie
    const baseDamage = player.attack || Math.floor(player.strength * 2);
    const randomFactor = Math.random() * 0.3 + 0.85; // 85% à 115% des dégâts
    const damage = Math.floor(baseDamage * randomFactor);
    
    // Appliquer la défense de l'ennemi (estimation)
    const enemyDefense = Math.floor(this.state.enemy.level * 3 + 10);
    return Math.max(1, damage - enemyDefense);
  }

  private calculateMagicalDamage(player: PlayerStats): number {
    // Formule style Final Fantasy: Attaque Magique - Défense Magique ennemie
    const baseDamage = player.magicAttack || Math.floor(player.magic * 2);
    const randomFactor = Math.random() * 0.3 + 0.85; // 85% à 115% des dégâts
    const damage = Math.floor(baseDamage * randomFactor);
    
    // Appliquer la défense magique de l'ennemi (estimation)
    const enemyMagicDefense = Math.floor(this.state.enemy.level * 2 + 5);
    return Math.max(1, damage - enemyMagicDefense);
  }

  private calculateDamage(attackStat: number, defenseStat: number): number {
    // Ancienne méthode pour les attaques ennemies
    const baseDamage = Math.floor(attackStat * 0.8 + Math.random() * attackStat * 0.4);
    const defense = Math.floor(defenseStat * 0.3);
    return Math.max(1, baseDamage - defense);
  }

  private calculateMagicDamage(wisdom: number): number {
    // Ancienne méthode pour compatibilité
    return Math.floor(wisdom * 1.2 + Math.random() * wisdom * 0.6);
  }

  private nextTurn(): void {
    this.state.playerDefending = false;
    this.state.enemyDefending = false;
    this.state.currentTurn++;
    // Victoire si l'ennemi est KO
    if (this.state.enemy.hp <= 0) {
      this.state.phase = 'victory';
      return;
    }
    // Défaite si tous les alliés sont KO
    const allKO = this.state.allies.every(a => a.baseStats.hp <= 0);
    if (allKO) {
      this.state.phase = 'defeat';
      return;
    }
    this.state.phase = 'action-selection';
  }

  public isPlayerTurn(): boolean {
    return this.state.phase === 'preparation' || this.getCurrentActor() === 'player';
  }

  public isCombatFinished(): boolean {
    return this.state.phase === 'victory' || this.state.phase === 'defeat';
  }

  public getVictoryRewards(): { xp: number; gold: number } {
    return {
      xp: this.state.enemy.xpReward,
      gold: this.state.enemy.goldReward
    };
  }
}
