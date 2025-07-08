// src/systems/CombatSystem.ts
import { PlayerStats, Enemy, CombatState, CombatAction, CombatTurn } from '../types/GameTypes';

export class CombatSystem {
  private state: CombatState;

  constructor(player: PlayerStats, enemy: Enemy) {
    this.state = {
      phase: 'preparation',
      playerStats: { ...player },
      enemy: { ...enemy },
      turnOrder: this.calculateTurnOrder(player, enemy),
      currentTurn: 0,
      combatLog: [],
      playerDefending: false,
      enemyDefending: false
    };
  }

  private calculateTurnOrder(player: PlayerStats, enemy: Enemy): ('player' | 'enemy')[] {
    // Système basé sur l'agilité comme dans FF10
    const playerSpeed = player.agility;
    const enemySpeed = enemy.agility;
    
    const order: ('player' | 'enemy')[] = [];
    let playerTicks = 0;
    let enemyTicks = 0;
    
    // Simuler 10 tours d'avance
    for (let i = 0; i < 10; i++) {
      playerTicks += playerSpeed;
      enemyTicks += enemySpeed;
      
      if (playerTicks >= enemyTicks) {
        order.push('player');
        playerTicks -= 100; // Reset après action
      } else {
        order.push('enemy');
        enemyTicks -= 100; // Reset après action
      }
    }
    
    return order;
  }

  public getCurrentActor(): 'player' | 'enemy' {
    return this.state.turnOrder[this.state.currentTurn % this.state.turnOrder.length];
  }

  public getState(): CombatState {
    return { ...this.state };
  }

  public executePlayerAction(action: CombatAction): CombatTurn {
    const turn: CombatTurn = {
      actor: 'player',
      action,
      target: 'enemy'
    };

    switch (action.type) {
      case 'attack':
        turn.damage = this.calculateDamage(this.state.playerStats.strength, this.state.enemy.agility);
        turn.critical = Math.random() < 0.1; // 10% chance critique
        turn.missed = Math.random() > action.accuracy;
        
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
        if (this.state.playerStats.mp >= (action.mpCost || 0)) {
          turn.damage = this.calculateMagicDamage(this.state.playerStats.wisdom);
          turn.missed = Math.random() > action.accuracy;
          
          if (!turn.missed) {
            const finalDamage = this.state.enemyDefending ? Math.floor(turn.damage * 0.7) : turn.damage;
            this.state.enemy.hp = Math.max(0, this.state.enemy.hp - finalDamage);
            this.state.playerStats.mp -= action.mpCost || 0;
          }
        }
        break;

      case 'defend':
        this.state.playerDefending = true;
        // Récupère un peu de MP
        this.state.playerStats.mp = Math.min(this.state.playerStats.maxMp, this.state.playerStats.mp + 5);
        break;

      case 'flee':
        // 50% chance de fuir, dépend de l'agilité
        const fleeChance = Math.min(0.8, this.state.playerStats.agility / (this.state.playerStats.agility + this.state.enemy.agility));
        if (Math.random() < fleeChance) {
          this.state.phase = 'defeat'; // Techniquement pas une défaite mais on sort du combat
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

    const turn: CombatTurn = {
      actor: 'enemy',
      action,
      target: 'player'
    };

    switch (randomAction) {
      case 'attack':
        turn.damage = this.calculateDamage(this.state.enemy.strength, this.state.playerStats.agility);
        turn.critical = Math.random() < 0.05; // 5% chance critique pour l'ennemi
        turn.missed = Math.random() > action.accuracy;
        
        if (!turn.missed) {
          const finalDamage = turn.critical ? turn.damage * 2 : turn.damage;
          if (this.state.playerDefending) {
            turn.damage = Math.floor(finalDamage * 0.5);
          } else {
            turn.damage = finalDamage;
          }
          this.state.playerStats.hp = Math.max(0, this.state.playerStats.hp - turn.damage);
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

  private calculateDamage(attackStat: number, defenseStat: number): number {
    const baseDamage = Math.floor(attackStat * 0.8 + Math.random() * attackStat * 0.4);
    const defense = Math.floor(defenseStat * 0.3);
    return Math.max(1, baseDamage - defense);
  }

  private calculateMagicDamage(wisdom: number): number {
    return Math.floor(wisdom * 1.2 + Math.random() * wisdom * 0.6);
  }

  private nextTurn(): void {
    // Reset des états de défense
    this.state.playerDefending = false;
    this.state.enemyDefending = false;
    
    this.state.currentTurn++;
    
    // Vérifier les conditions de victoire/défaite
    if (this.state.enemy.hp <= 0) {
      this.state.phase = 'victory';
    } else if (this.state.playerStats.hp <= 0) {
      this.state.phase = 'defeat';
    } else {
      this.state.phase = 'action-selection';
    }
  }

  public isPlayerTurn(): boolean {
    return this.getCurrentActor() === 'player';
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
