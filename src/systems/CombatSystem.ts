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
    // Système inspiré de Final Fantasy X avec CT (Charge Time)
    const playerSpeed = player.speed || player.dexterity * 2;
    const enemySpeed = enemy.agility || 20;
    
    const order: ('player' | 'enemy')[] = [];
    let playerCT = 0;
    let enemyCT = 0;
    
    // Simuler plus de tours pour avoir une meilleure prédiction
    for (let i = 0; i < 50; i++) {
      // Ajouter la vitesse au CT de chaque acteur
      playerCT += playerSpeed;
      enemyCT += enemySpeed;
      
      // Celui qui atteint 100 CT en premier joue
      if (playerCT >= 100 && enemyCT >= 100) {
        // En cas d'égalité, celui avec la plus haute vitesse joue en premier
        if (playerSpeed >= enemySpeed) {
          order.push('player');
          playerCT -= 100;
        } else {
          order.push('enemy');
          enemyCT -= 100;
        }
      } else if (playerCT >= 100) {
        order.push('player');
        playerCT -= 100;
      } else if (enemyCT >= 100) {
        order.push('enemy');
        enemyCT -= 100;
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
        turn.damage = this.calculatePhysicalDamage(this.state.playerStats);
        turn.critical = Math.random() < (this.state.playerStats.criticalRate / 100);
        turn.missed = Math.random() > (this.state.playerStats.hitRate / 100);
        
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
          turn.damage = this.calculateMagicalDamage(this.state.playerStats);
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
        // Chance de fuir basée sur la vitesse
        const fleeChance = Math.min(0.8, this.state.playerStats.speed / (this.state.playerStats.speed + (this.state.enemy.agility || 20)));
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
        turn.damage = this.calculateEnemyDamage(this.state.enemy, this.state.playerStats);
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
