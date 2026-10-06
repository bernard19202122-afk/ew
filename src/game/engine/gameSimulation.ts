/**
 * Elemental Wildguard - Deterministic Game Simulation Engine
 * PRD v2.2 Compliant Fixed-Timestep (60Hz) Simulation.
 * Encapsulates full combat lifecycle, wave progression, entity management,
 * and deterministic save/load state.
 */

import { BALANCE_CONFIG } from '../config/balanceConfig';
import { ENEMY_REGISTRY, EnemyTemplate } from '../data/enemyRegistry';
import { HERO_REGISTRY } from '../data/heroRegistry';
import { WAVE_DEFINITIONS, WaveDefinition, WaveSpawnItem } from '../data/waveRegistry';
import { CAMPAIGN_LEVELS, LevelConfig } from '../data/levelRegistry';
import { progression } from './progressionManager';
import {
  ActiveZoneInstance,
  CombatLogEntry,
  EarthWallInstance,
  Element,
  EnemyClass,
  EnemyInstance,
  FloatingDamageNumber,
  GameStateSnapshot,
  HeroInstance,
  ProjectileInstance,
  TacticalSlot,
} from '../types/gameTypes';
import {
  calculateCCDuration,
  calculateEffectiveAttackSpeed,
  calculateEliteReward,
  calculateFinalDamage,
  calculatePullDisplacement,
  getCritStats,
  getHeroLevelMultiplier,
  roundHalfUp,
} from './combatFormulas';
import {
  getDistance,
  GRID_HEIGHT,
  GRID_WIDTH,
  isBaseTile,
  LANE_PATHS,
  TACTICAL_HERO_SLOTS,
  validateEarthWallPlacement,
} from './pathfinding';
import { PCG32, RNGSnapshot } from './rng';
import { SynergyManager } from './synergySystem';
import { sound } from '../audio/soundSynthesizer';

export interface AttackBeam {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  element: Element;
  duration: number;
  maxDuration: number;
}

export class GameSimulation {
  public rng: PCG32;
  public synergyManager: SynergyManager;

  public tick: number = 0;
  public gameSpeed: number = 1; // 1x, 2x, 3x
  public isPaused: boolean = false;
  public isBattleActive: boolean = false;
  public phase: 'IDLE' | 'PREPARATION' | 'COMBAT' | 'VICTORY' | 'GAME_OVER' | 'LEVEL_VICTORY' | 'LEVEL_DEFEAT' = 'IDLE';

  // Campaign Level vs Waves Distinction
  public currentLevel: number = 1;
  public levelWavesCount: number = 5;
  public currentWaveInLevel: number = 1;
  public levelVictoryDetails: {
    levelNumber: number;
    stars: number;
    score: number;
    rewardGold: number;
    newlyUnlocked: boolean;
  } | null = null;

  public wave: number = 1;
  public preparationTimer: number = 8.0;
  public gold: number = 500;
  public baseHP: number = 100;

  // 2-Player Co-op State
  public playerMode: 'single' | 'coop' = 'single';
  public activePlayerId: 'P1' | 'P2' = 'P1';
  public p1Gold: number = 500;
  public p2Gold: number = 500;

  public getPlayerGold(player: 'P1' | 'P2' = this.activePlayerId): number {
    if (this.playerMode === 'coop') {
      return player === 'P2' ? this.p2Gold : this.p1Gold;
    }
    return this.gold;
  }

  public deductPlayerGold(amount: number, player: 'P1' | 'P2' = this.activePlayerId): boolean {
    if (this.playerMode === 'coop') {
      if (player === 'P2') {
        if (this.p2Gold < amount) return false;
        this.p2Gold -= amount;
        return true;
      } else {
        if (this.p1Gold < amount) return false;
        this.p1Gold -= amount;
        return true;
      }
    } else {
      if (this.gold < amount) return false;
      this.gold -= amount;
      return true;
    }
  }

  public addPlayerGold(amount: number, player?: 'P1' | 'P2'): void {
    if (this.playerMode === 'coop') {
      if (player === 'P2') {
        this.p2Gold += amount;
      } else if (player === 'P1') {
        this.p1Gold += amount;
      } else {
        // Shared reward: both receive bonus
        this.p1Gold += amount;
        this.p2Gold += amount;
      }
    } else {
      this.gold += amount;
    }
  }

  public heroes: HeroInstance[] = [];
  public enemies: EnemyInstance[] = [];
  public earthWalls: EarthWallInstance[] = [];
  public projectiles: ProjectileInstance[] = [];
  public activeZones: ActiveZoneInstance[] = [];
  public floatingNumbers: FloatingDamageNumber[] = [];
  public combatLogs: CombatLogEntry[] = [];
  public tacticalSlots: TacticalSlot[] = [];
  public attackBeams: AttackBeam[] = [];
  public particles: Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    lifetime: number;
    maxLifetime: number;
  }> = [];

  // Commander Tactical Superpowers Cooldowns (in seconds)
  public commanderCooldowns = {
    orbitalStrike: 0,
    bioBarrier: 0,
    cryoFreeze: 0,
    droneHarvest: 0,
  };

  // Screen & Visual FX triggers
  public screenShakeTimer: number = 0;
  public baseAlertFlashTimer: number = 0;
  public bossIncomingBanner: { name: string; enemyClass: string; duration: number } | null = null;
  public waveClearBanner: { wave: number; goldBonus: number; duration: number } | null = null;

  public autoStartNextWave: boolean = true;
  public onBossArrival?: (bossName: string, element: string, hp: number) => void;
  public onScreenShake?: (intensity: number) => void;

  // Wave spawn handling
  private currentWaveSpawnQueue: WaveSpawnItem[] = [];
  private spawnDelayTimer: number = 0;
  private currentSpawnLaneToggle: number = 0;

  // Investment tracking for exact 70% refund calculation
  private heroInvestments: Record<string, number> = {};

  // Deterministic ID generator
  private nextEntityId: number = 1;
  private nextProjectileId: number = 1;
  private nextZoneId: number = 1;
  private nextFloatingId: number = 1;
  private nextLogId: number = 1;
  private nextParticleId: number = 1;

  public totalEnemiesDefeated: number = 0;
  public totalDamageDealt: number = 0;

  constructor(seed: bigint | number = 42n) {
    this.rng = new PCG32(seed);
    this.synergyManager = new SynergyManager();
    this.initializeSlots();
    this.prepareWave(1);
  }

  private initializeSlots(): void {
    this.tacticalSlots = TACTICAL_HERO_SLOTS.map((s) => ({ ...s }));
  }

  /**
   * Initializes a completely fresh, isolated battle session.
   * STRICT SEPARATION: persistentProgress != battleState
   * Reset every match:
   * - Gold resets to BalanceConfig/CAMPAIGN_LEVELS starting gold
   * - Core HP resets to 100
   * - Wave resets to 1
   * - Towers/Heroes completely removed and reset to starting Level 1 squad
   * - Cooldowns, buffs, enemies, projectiles reset to 0
   */
  public initFreshSession(
    levelNum: number = 1,
    playerMode: 'single' | 'coop' = 'single',
    activePlayer: 'P1' | 'P2' = 'P1'
  ): void {
    const validLevel = Math.max(1, Math.min(10, levelNum));
    this.currentLevel = validLevel;
    this.playerMode = playerMode;
    this.activePlayerId = activePlayer;

    const levelCfg = CAMPAIGN_LEVELS[validLevel] || CAMPAIGN_LEVELS[1];
    const baseLevel = progression.getProgress().baseLevel || 1;
    const goldBonus = BALANCE_CONFIG.baseStats.startingGoldBonus[baseLevel] || 0;
    this.levelWavesCount = levelCfg.totalWaves;
    this.currentWaveInLevel = 1;
    this.gold = (levelCfg.startingGold ?? 500) + goldBonus;
    this.p1Gold = this.gold;
    this.p2Gold = this.gold;
    this.baseHP = BALANCE_CONFIG.baseStats.baseHP[baseLevel] || 100;
    this.phase = 'PREPARATION';
    this.levelVictoryDetails = null;

    // Reset battle entities completely
    this.heroes = [];
    this.heroInvestments = {};
    this.initializeSlots();
    this.enemies = [];
    this.projectiles = [];
    this.attackBeams = [];
    this.particles = [];
    this.floatingNumbers = [];
    this.earthWalls = [];
    this.combatLogs = [];
    this.screenShakeTimer = 0;
    this.baseAlertFlashTimer = 0;
    this.totalDamageDealt = 0;
    this.totalEnemiesDefeated = 0;

    // Reset commander cooldowns
    this.commanderCooldowns = {
      orbitalStrike: 0,
      bioBarrier: 0,
      cryoFreeze: 0,
      droneHarvest: 0,
    };

    // Deploy fresh Level 1 starter squad (Level 1 towers, 0 upgrades)
    this.deployStarterTeam(playerMode === 'coop' ? 'P1' : undefined);

    // Prepare Wave 1 of this level
    this.prepareWave(levelCfg.startWaveGlobalIndex);
    this.addLog(`=== [LEVEL ${validLevel}] ${levelCfg.name.toUpperCase()} INITIALIZED ===`, 'system');
    this.addLog(`Objective: Clear all ${levelCfg.totalWaves} waves! Suggested: ${levelCfg.recommendedElements.join(', ')}.`, 'system');
    if (playerMode === 'coop') {
      this.addLog(`2-Player Co-op Active: P1 Gold ${this.p1Gold}G, P2 Gold ${this.p2Gold}G. Shared Core HP: 100%.`, 'system');
    }
  }

  public startLevel(levelNum: number): void {
    this.createNewGameSession(levelNum, this.playerMode, this.activePlayerId);
  }

  public retryCurrentLevel(): void {
    this.createNewGameSession(this.currentLevel, this.playerMode, this.activePlayerId);
  }

  public startNextLevel(): void {
    if (this.currentLevel < 5) {
      this.createNewGameSession(this.currentLevel + 1, this.playerMode, this.activePlayerId);
    } else {
      this.createNewGameSession(5, this.playerMode, this.activePlayerId);
    }
  }

  public rematch(): void {
    this.createNewGameSession(this.currentLevel, this.playerMode, this.activePlayerId);
  }

  /**
   * Dedicated game session creation method.
   * Completely discards prior in-memory battlefield state.
   */
  public createNewGameSession(
    levelId: number = 1,
    playerMode: 'single' | 'coop' = 'single',
    activePlayer: 'P1' | 'P2' = 'P1'
  ): void {
    this.initFreshSession(levelId, playerMode, activePlayer);
  }

  public prepareWave(waveNum: number): void {
    this.wave = Math.max(1, Math.min(30, waveNum));
    this.phase = 'PREPARATION';

    const waveDef = WAVE_DEFINITIONS[this.wave - 1];
    this.preparationTimer = waveDef ? waveDef.preparationTime : 8.0;
    this.currentWaveSpawnQueue = waveDef ? [...waveDef.spawns] : [];
    this.spawnDelayTimer = 0.5;

    // Revive dead heroes at 30% Max HP, 0 Energy, 0 CD (PRD A4)
    for (const h of this.heroes) {
      if (h.isDead) {
        h.isDead = false;
        h.currentHP = roundHalfUp(h.maxHP * 0.30);
        h.energy = 0;
        h.activeSkillCooldown = 0;
        h.ultimateCooldown = 0;
        this.addLog(`Hero ${h.name} revived for Wave ${this.wave} with 30% HP!`, 'system');
      }
    }
  }

  public startBattleSession(): void {
    this.isBattleActive = true;
    this.isPaused = false;
    if (this.phase === 'IDLE') {
      const levelCfg = CAMPAIGN_LEVELS[this.currentLevel] || CAMPAIGN_LEVELS[1];
      this.prepareWave(levelCfg.startWaveGlobalIndex);
    }
  }

  public stopBattleSession(): void {
    this.isBattleActive = false;
    this.isPaused = true;
    this.phase = 'IDLE';
    this.enemies = [];
    this.projectiles = [];
    this.attackBeams = [];
    this.particles = [];
    this.floatingNumbers = [];
    this.earthWalls = [];
    this.currentWaveSpawnQueue = [];
    this.preparationTimer = 0;
  }

  public startCombatPhase(): void {
    if (this.phase !== 'PREPARATION') return;
    this.phase = 'COMBAT';
    this.addLog(`Wave ${this.wave} begun! Foes advancing toward the Base.`, 'system');
  }

  public addLog(message: string, type: CombatLogEntry['type'] = 'system'): void {
    this.combatLogs.unshift({
      id: this.nextLogId++,
      tick: this.tick,
      wave: this.wave,
      message,
      type,
    });
    if (this.combatLogs.length > 80) {
      this.combatLogs.pop();
    }
  }

  public addFloatingNumber(text: string, x: number, y: number, color: string, isCrit: boolean = false): void {
    this.floatingNumbers.push({
      id: this.nextFloatingId++,
      text,
      x,
      y,
      color,
      isCrit,
      opacity: 1.0,
      lifetime: 0.8,
    });
    if (this.floatingNumbers.length > BALANCE_CONFIG.globalCaps.maxDamageNumbersRecommended) {
      this.floatingNumbers.shift();
    }
  }

  /**
   * Deploys a balanced starter squad (Pyra, Terra, Aqua) for immediate playability.
   * Towers always start at Level 1 with 0 upgrades.
   */
  public deployStarterTeam(owner?: 'P1' | 'P2'): void {
    if (this.heroes.length === 0) {
      const prevGold = this.gold;
      const prevP1 = this.p1Gold;
      const prevP2 = this.p2Gold;

      // Provide temporary deployment credit for initial starter trio
      this.gold = 1000;
      this.p1Gold = 1000;
      this.p2Gold = 1000;

      this.deployHero('Pyra', 0, owner || 'P1');
      this.deployHero('Terra', 3, owner || 'P1');
      this.deployHero('Aqua', 2, this.playerMode === 'coop' ? 'P2' : (owner || 'P1'));

      // Restore exact starting gold from Level configuration
      this.gold = prevGold;
      this.p1Gold = prevP1;
      this.p2Gold = prevP2;
      this.addLog(`Starter squad deployed: Pyra (Fire), Terra (Earth), Aqua (Water)!`, 'system');
    }
  }

  /**
   * Deployment: places a new hero in an unoccupied tactical slot.
   * Enforces: Max 6 heroes, valid slot, valid player gold.
   * Allows duplicate hero deployment so players can merge duplicates!
   */
  public deployHero(templateId: string, slotIndex: number, owner?: 'P1' | 'P2'): boolean {
    const baseLevel = progression.getProgress().baseLevel || 1;
    const maxCapacity = this.playerMode === 'coop' ? 6 : (BALANCE_CONFIG.baseStats.defenderCapacity[baseLevel] || 6);

    // PRD v3.0 Section 13: Strictly NO duplicate hero in squad/battlefield
    if (this.heroes.some((h) => h.templateId === templateId)) {
      this.addLog(`Deployment rejected: Hero ${templateId} sudah ada di squad! Aturan PRD v3.0 melarang duplikat hero.`, 'system');
      return false;
    }

    if (this.playerMode === 'coop') {
      const playerRole = owner || this.activePlayerId;
      const countForPlayer = this.heroes.filter((h) => h.ownerPlayerId === playerRole).length;
      if (countForPlayer >= 3) {
        this.addLog(`Deployment rejected: Maximum 3 active heroes per player in Co-op mode.`, 'system');
        return false;
      }
    } else {
      if (this.heroes.length >= maxCapacity) {
        this.addLog(`Deployment rejected: Kapasitas defender penuh (Maks ${maxCapacity} hero untuk Base Lv.${baseLevel}).`, 'system');
        return false;
      }
    }

    const slot = this.tacticalSlots.find((s) => s.slotIndex === slotIndex);
    if (!slot || slot.occupiedHeroInstanceId) {
      this.addLog(`Deployment rejected: Slot ${slotIndex} is invalid or occupied.`, 'system');
      return false;
    }

    const template = HERO_REGISTRY[templateId];
    if (!template) return false;

    const deployCost = BALANCE_CONFIG.economy.deploymentCosts[template.rarity];
    const playerRole = owner || this.activePlayerId;

    if (!this.deductPlayerGold(deployCost, playerRole)) {
      const currentGold = this.getPlayerGold(playerRole);
      this.addLog(`Deployment rejected: Need ${deployCost} Gold (Have ${currentGold}).`, 'system');
      return false;
    }

    const instanceId = `hero_${templateId}_${this.nextEntityId++}`;
    this.heroInvestments[instanceId] = deployCost;

    const newHero: HeroInstance = {
      instanceId,
      templateId,
      name: template.name,
      element: template.element,
      rarity: template.rarity,
      role: template.role,
      level: 1,
      starLevel: 1,
      ownerPlayerId: playerRole,
      slotIndex,
      tileX: slot.tileX,
      tileY: slot.tileY,

      currentHP: template.baseHP,
      maxHP: template.baseHP,
      baseATK: template.baseATK,
      effectiveATK: template.baseATK,
      baseAS: template.baseAS,
      effectiveAS: template.baseAS,
      baseDEF: template.baseDEF,
      effectiveDEF: template.baseDEF,
      range: template.baseRange,

      energy: 0,
      energyGainThisSecond: 0,
      secondTimer: 0,

      attackCooldown: 0,
      activeSkillCooldown: 0,
      ultimateCooldown: 0,

      isDead: false,
      kills: 0,
      damageDealt: 0,

      shield: 0,
      shieldDuration: 0,
      attackSpeedBuffs: [],
    };

    slot.occupiedHeroInstanceId = instanceId;
    slot.ownerPlayerId = playerRole;
    this.heroes.push(newHero);
    this.recalculateHeroStats(newHero);
    this.addLog(`[${playerRole}] Deployed ${template.name} (${template.element}) to Slot ${slotIndex} (-${deployCost} Gold).`, 'system');
    return true;
  }

  /**
   * Upgrades a hero to the next level (up to 10).
   * Exact PRD costs: 1->2 (150), 2->3 (250) ... total 5,050 Gold.
   */
  public upgradeHero(instanceId: string, player?: 'P1' | 'P2'): boolean {
    const hero = this.heroes.find((h) => h.instanceId === instanceId);
    if (!hero) return false;

    const playerRole = player || this.activePlayerId;
    if (this.playerMode === 'coop' && hero.ownerPlayerId && hero.ownerPlayerId !== playerRole) {
      this.addLog(`Upgrade rejected: You can only upgrade your own heroes!`, 'system');
      return false;
    }

    if (hero.level >= 10) {
      this.addLog(`Upgrade rejected: ${hero.name} is already at Max Level (10)!`, 'system');
      return false;
    }

    const cost = BALANCE_CONFIG.economy.upgradeCosts[hero.level - 1];
    if (!this.deductPlayerGold(cost, playerRole)) {
      const currentGold = this.getPlayerGold(playerRole);
      this.addLog(`Upgrade failed: Need ${cost} Gold (Have ${currentGold}).`, 'system');
      return false;
    }

    this.heroInvestments[hero.instanceId] = (this.heroInvestments[hero.instanceId] ?? 0) + cost;
    hero.level++;

    this.recalculateHeroStats(hero);
    hero.currentHP = hero.maxHP; // Level up fully heals hero

    sound.playLevelUp();
    this.addParticleBurst(hero.tileX + 0.5, hero.tileY + 0.5, '#fbbf24', 16, 4.0);

    this.addLog(`[${playerRole}] Upgraded ${hero.name} to Level ${hero.level}! (-${cost} Gold)`, 'system');
    return true;
  }

  /**
   * Merges two heroes:
   * Target hero gains +1 Star Level (★ -> ★★ -> ★★★).
   * Stats boosted: +50% ATK, +40% HP, +25% DEF, fully heals target.
   * Source hero is consumed and its tactical slot is freed!
   * Combined investment is retained for fair 70% refund if sold later.
   */
  public mergeHeroes(targetInstanceId: string, sourceInstanceId: string, player?: 'P1' | 'P2'): boolean {
    if (targetInstanceId === sourceInstanceId) return false;

    const targetHero = this.heroes.find((h) => h.instanceId === targetInstanceId);
    const sourceHero = this.heroes.find((h) => h.instanceId === sourceInstanceId);
    if (!targetHero || !sourceHero) return false;

    const playerRole = player || this.activePlayerId;
    if (this.playerMode === 'coop') {
      if (targetHero.ownerPlayerId !== playerRole || sourceHero.ownerPlayerId !== playerRole) {
        this.addLog(`Merge rejected: You can only merge your own heroes!`, 'system');
        return false;
      }
    }

    if (targetHero.starLevel >= 3) {
      this.addLog(`Merge rejected: ${targetHero.name} has already reached maximum 3-Star rank (★★★)!`, 'system');
      return false;
    }

    const isSameTemplate = targetHero.templateId === sourceHero.templateId;
    const isSameElement = targetHero.element === sourceHero.element;

    if (!isSameTemplate && !isSameElement) {
      this.addLog(`Merge rejected: Heroes must share the same Champion or Element to merge!`, 'system');
      return false;
    }

    targetHero.starLevel = Math.min(3, (targetHero.starLevel || 1) + 1);

    const atkMultiplier = isSameTemplate ? 1.50 : 1.30;
    const hpMultiplier = isSameTemplate ? 1.40 : 1.25;

    targetHero.baseATK = roundHalfUp(targetHero.baseATK * atkMultiplier);
    targetHero.maxHP = roundHalfUp(targetHero.maxHP * hpMultiplier);
    targetHero.currentHP = targetHero.maxHP;
    targetHero.baseDEF = roundHalfUp(targetHero.baseDEF * 1.25);

    // Merge investment tracking
    const sourceInvestment = this.heroInvestments[sourceHero.instanceId] ?? 0;
    this.heroInvestments[targetHero.instanceId] = (this.heroInvestments[targetHero.instanceId] ?? 0) + sourceInvestment;

    // Free source hero slot and remove source hero
    const sourceSlot = this.tacticalSlots.find((s) => s.slotIndex === sourceHero.slotIndex);
    if (sourceSlot) {
      sourceSlot.occupiedHeroInstanceId = undefined;
      sourceSlot.ownerPlayerId = undefined;
    }
    delete this.heroInvestments[sourceHero.instanceId];

    const sourceIdx = this.heroes.findIndex((h) => h.instanceId === sourceHero.instanceId);
    if (sourceIdx !== -1) {
      this.heroes.splice(sourceIdx, 1);
    }

    this.recalculateHeroStats(targetHero);

    // Visual & Audio Feedback
    sound.playStarFanfare(targetHero.starLevel);
    sound.playLevelUp();
    this.addParticleBurst(targetHero.tileX, targetHero.tileY, '#facc15', 25, 4.5);
    this.addParticleBurst(targetHero.tileX, targetHero.tileY, targetHero.element === 'Fire' ? '#f97316' : '#38bdf8', 20, 3.5);
    this.addFloatingNumber(`MERGE UP! ★${targetHero.starLevel}`, targetHero.tileX, targetHero.tileY, '#fbbf24', true);

    this.addLog(
      `⭐ FUSION MERGE: [${playerRole}] ${targetHero.name} merged with ${sourceHero.name}! Star Rank upgraded to ★${targetHero.starLevel} (+${Math.round((atkMultiplier - 1) * 100)}% ATK, +${Math.round((hpMultiplier - 1) * 100)}% HP)! Slot freed.`,
      'burst'
    );
    return true;
  }

  /**
   * Sells a hero:
   * Grants exactly 70% refund of total investment (PRD Section C5, B10).
   * Frees tactical slot for new deployments!
   */
  public sellHero(instanceId: string, player?: 'P1' | 'P2'): boolean {
    const heroIdx = this.heroes.findIndex((h) => h.instanceId === instanceId);
    if (heroIdx === -1) return false;

    const hero = this.heroes[heroIdx];
    const playerRole = player || this.activePlayerId;
    if (this.playerMode === 'coop' && hero.ownerPlayerId && hero.ownerPlayerId !== playerRole) {
      this.addLog(`Sale rejected: You can only sell your own heroes!`, 'system');
      return false;
    }

    const totalInvested = this.heroInvestments[hero.instanceId] ?? 0;
    const refund = roundHalfUp(totalInvested * BALANCE_CONFIG.economy.sellRefund);

    const slot = this.tacticalSlots.find((s) => s.slotIndex === hero.slotIndex);
    if (slot) {
      slot.occupiedHeroInstanceId = undefined;
      slot.ownerPlayerId = undefined;
    }

    this.heroes.splice(heroIdx, 1);
    delete this.heroInvestments[hero.instanceId];
    this.addPlayerGold(refund, playerRole);

    sound.playCoinClink();
    this.addParticleBurst(hero.tileX, hero.tileY, '#facc15', 18, 3.8);
    this.addFloatingNumber(`+${refund} GOLD`, hero.tileX, hero.tileY, '#fbbf24', true);
    this.addLog(
      `[${playerRole}] Sold ${hero.name} (Lv${hero.level}${hero.starLevel > 1 ? ` ★${hero.starLevel}` : ''}) for +${refund} Gold (70% refund of ${totalInvested}G). Slot freed.`,
      'system'
    );
    return true;
  }

  /**
   * Moves a hero to another valid empty slot during Preparation phase.
   */
  public moveHero(instanceId: string, targetSlotIndex: number): boolean {
    if (this.phase !== 'PREPARATION') {
      this.addLog(`Moving heroes only allowed during Preparation phase!`, 'system');
      return false;
    }

    const hero = this.heroes.find((h) => h.instanceId === instanceId);
    const targetSlot = this.tacticalSlots.find((s) => s.slotIndex === targetSlotIndex);
    if (!hero || !targetSlot || targetSlot.occupiedHeroInstanceId) return false;

    const oldSlot = this.tacticalSlots.find((s) => s.slotIndex === hero.slotIndex);
    if (oldSlot) oldSlot.occupiedHeroInstanceId = undefined;

    targetSlot.occupiedHeroInstanceId = hero.instanceId;
    hero.slotIndex = targetSlotIndex;
    hero.tileX = targetSlot.tileX;
    hero.tileY = targetSlot.tileY;

    this.recalculateHeroStats(hero);
    this.addLog(`Moved ${hero.name} to Slot ${targetSlotIndex}.`, 'system');
    return true;
  }

  public recalculateHeroStats(hero: HeroInstance): void {
    const template = HERO_REGISTRY[hero.templateId];
    if (!template) return;

    const multiplier = getHeroLevelMultiplier(hero.level);
    const starMultATK = hero.starLevel === 3 ? 2.0 : hero.starLevel === 2 ? 1.5 : 1.0;
    const starMultHP = hero.starLevel === 3 ? 1.8 : hero.starLevel === 2 ? 1.4 : 1.0;
    const starMultDEF = hero.starLevel === 3 ? 1.5 : hero.starLevel === 2 ? 1.25 : 1.0;

    hero.maxHP = roundHalfUp(template.baseHP * multiplier * starMultHP);
    hero.effectiveATK = roundHalfUp(template.baseATK * multiplier * starMultATK);
    hero.effectiveDEF = roundHalfUp(template.baseDEF * multiplier * starMultDEF);

    // 4-Element Awakening bonus (+15% dmg, +10% AS, +10% DEF, +10% range)
    const hasAwakening = this.synergyManager.isFourElementAwakeningActive(this.heroes);
    let rangeBonus = hasAwakening ? 0.10 : 0;
    let defBonus = hasAwakening ? 0.10 : 0;
    let asBonus = hasAwakening ? 0.10 : 0;

    // Slot terrain bonus (PRD Section 8)
    const slot = this.tacticalSlots.find((s) => s.slotIndex === hero.slotIndex);
    if (slot?.terrainBonus) {
      if (slot.terrainBonus === 'Earth') defBonus += BALANCE_CONFIG.terrain.Earth.defenseBonus; // +15%
      if (slot.terrainBonus === 'Wind') rangeBonus += BALANCE_CONFIG.terrain.Wind.rangeBonus; // +10%
    }

    // Role exceptions cap check (PRD Section B1)
    hero.range = template.baseRange * (1.0 + rangeBonus);
    if (hero.role === 'Support' && hero.range > BALANCE_CONFIG.heroStats.roleExceptions.support.maxRange) {
      hero.range = BALANCE_CONFIG.heroStats.roleExceptions.support.maxRange;
    }
    if (hero.role === 'Ranged' && hero.range > BALANCE_CONFIG.heroStats.roleExceptions.ranged.maxRange) {
      hero.range = BALANCE_CONFIG.heroStats.roleExceptions.ranged.maxRange;
    }

    hero.effectiveDEF = roundHalfUp(hero.effectiveDEF * (1.0 + defBonus));

    // Attack speed calculation with additive buffs (PRD Section C2)
    const totalBuffs = [...hero.attackSpeedBuffs];
    if (asBonus > 0) totalBuffs.push({ percent: asBonus, duration: 9999, source: 'Awakening' });
    hero.effectiveAS = calculateEffectiveAttackSpeed(template.baseAS, totalBuffs, []);
  }

  /**
   * Spawns an enemy into the lane.
   */
  public spawnEnemy(templateId: string, isElite: boolean = false, laneIndex?: number): void {
    const template = ENEMY_REGISTRY[templateId];
    if (!template) return;

    const lane = laneIndex !== undefined ? laneIndex : this.currentSpawnLaneToggle;
    this.currentSpawnLaneToggle = (this.currentSpawnLaneToggle + 1) % LANE_PATHS.length;

    const path = LANE_PATHS[lane];
    const spawnPt = path[0];

    const isBoss = template.enemyClass === 'MiniBoss' || template.enemyClass === 'Boss' || template.enemyClass === 'MapBoss';

    let hp = template.baseHP;
    let def = template.baseDEF;
    let atk = template.attackDamage;
    let speed = template.baseSpeed;
    let reward = template.goldReward;

    // Wave scaling applies to Normal and Elite ONLY (PRD D2 & PRD v3.0 Section 35)
    if (!isBoss) {
      const waveHpMul = 1.0 + (this.wave - 1) * 0.12;
      const waveDmgMul = 1.0 + (this.wave - 1) * 0.08;
      const waveSpdMul = Math.min(1.0 + this.wave * 0.01, 1.30);
      // PRD v3.0 Section 35 Defender Modifier: 1 + ((ActiveDefenders - 6) * 0.08)
      const defenderMod = 1.0 + Math.max(0, this.heroes.length - 6) * 0.08;

      hp = roundHalfUp(hp * waveHpMul * defenderMod);
      atk = roundHalfUp(atk * waveDmgMul * defenderMod);
      speed = speed * waveSpdMul;

      if (isElite) {
        hp = roundHalfUp(hp * 2.0);
        atk = roundHalfUp(atk * 1.5);
        def = roundHalfUp(def * 1.3);
        reward = calculateEliteReward(template.goldReward);
      }
    }

    const enemy: EnemyInstance = {
      instanceId: this.nextEntityId++,
      templateId,
      name: isElite ? `Elite ${template.name}` : template.name,
      element: template.element,
      enemyClass: isElite ? 'Elite' : template.enemyClass,
      currentHP: hp,
      maxHP: hp,
      defense: def,
      baseSpeed: speed,
      currentSpeed: speed,
      attackSpeed: template.attackSpeed,
      attackDamage: atk,
      range: template.range,
      attackType: template.attackType,
      goldReward: reward,

      laneIndex: lane,
      pathIndex: 0,
      tileX: spawnPt.x,
      tileY: spawnPt.y,
      distanceTraveled: 0,

      statuses: {
        burns: [],
      },
      attackCooldown: 0,

      bossPhase: isBoss ? 1 : undefined,
      bossSpecialTimer: isBoss ? 0 : undefined,
      eliteMechanic: isElite ? templateId : undefined,
    };

    this.enemies.push(enemy);

    if (isBoss) {
      this.bossIncomingBanner = { name: template.name, enemyClass: template.enemyClass, duration: 4.5 };
      sound.playBossAlert();
      this.screenShakeTimer = 0.5;
    }
  }

  /**
   * Main simulation step: executes `n` ticks at fixed 60Hz timestep.
   * GOLDEN RULE (PRD Section 3): Only runs when isBattleActive === true!
   */
  public step(numTicks: number = 1): void {
    if (!this.isBattleActive || this.isPaused || this.phase === 'IDLE') return;

    const dt = BALANCE_CONFIG.globalCaps.fixedTimestep; // 1/60s
    for (let i = 0; i < numTicks; i++) {
      this.updateSingleTick(dt);
      this.tick++;
    }
  }

  private updateSingleTick(dt: number): void {
    this.synergyManager.updateBurstCooldown(dt);

    // Floating text decay
    for (let i = this.floatingNumbers.length - 1; i >= 0; i--) {
      const fn = this.floatingNumbers[i];
      fn.y -= 0.5 * dt;
      fn.lifetime -= dt;
      fn.opacity = Math.max(0, fn.lifetime / 0.8);
      if (fn.lifetime <= 0) {
        this.floatingNumbers.splice(i, 1);
      }
    }

    // Decay attack beams
    for (let i = this.attackBeams.length - 1; i >= 0; i--) {
      this.attackBeams[i].duration -= dt;
      if (this.attackBeams[i].duration <= 0) {
        this.attackBeams.splice(i, 1);
      }
    }

    // Decay particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetime -= dt;
      if (p.lifetime <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Decay commander cooldowns
    if (this.commanderCooldowns.orbitalStrike > 0) this.commanderCooldowns.orbitalStrike = Math.max(0, this.commanderCooldowns.orbitalStrike - dt);
    if (this.commanderCooldowns.bioBarrier > 0) this.commanderCooldowns.bioBarrier = Math.max(0, this.commanderCooldowns.bioBarrier - dt);
    if (this.commanderCooldowns.cryoFreeze > 0) this.commanderCooldowns.cryoFreeze = Math.max(0, this.commanderCooldowns.cryoFreeze - dt);
    if (this.commanderCooldowns.droneHarvest > 0) this.commanderCooldowns.droneHarvest = Math.max(0, this.commanderCooldowns.droneHarvest - dt);

    // Screen shake & banner decays
    if (this.screenShakeTimer > 0) this.screenShakeTimer = Math.max(0, this.screenShakeTimer - dt);
    if (this.baseAlertFlashTimer > 0) this.baseAlertFlashTimer = Math.max(0, this.baseAlertFlashTimer - dt);
    if (this.bossIncomingBanner) {
      this.bossIncomingBanner.duration -= dt;
      if (this.bossIncomingBanner.duration <= 0) this.bossIncomingBanner = null;
    }
    if (this.waveClearBanner) {
      this.waveClearBanner.duration -= dt;
      if (this.waveClearBanner.duration <= 0) this.waveClearBanner = null;
    }

    // Phase handling
    if (this.phase === 'PREPARATION') {
      this.preparationTimer -= dt;
      if (this.preparationTimer <= 0) {
        this.startCombatPhase();
      }
      return;
    }

    if (this.phase === 'COMBAT') {
      this.updateSpawns(dt);
      this.updateHeroes(dt);
      this.updateProjectiles(dt);
      this.updateActiveZones(dt);
      this.updateEnemies(dt);
      this.checkWaveCompletion();
    }
  }

  private updateSpawns(dt: number): void {
    if (this.currentWaveSpawnQueue.length === 0) return;

    this.spawnDelayTimer -= dt;
    if (this.spawnDelayTimer <= 0) {
      const nextSpawn = this.currentWaveSpawnQueue.shift();
      if (nextSpawn) {
        this.spawnEnemy(nextSpawn.enemyTemplateId, nextSpawn.isElite, nextSpawn.laneIndex);
        this.spawnDelayTimer = nextSpawn.delayBeforeNext;
      }
    }
  }

  private updateHeroes(dt: number): void {
    const hasAwakening = this.synergyManager.isFourElementAwakeningActive(this.heroes);

    for (const hero of this.heroes) {
      if (hero.isDead) continue;

      // Energy 1-second cap maintenance (PRD A7 & BalanceConfig: max 20 energy/sec)
      hero.secondTimer += dt;
      if (hero.secondTimer >= 1.0) {
        hero.secondTimer = 0;
        hero.energyGainThisSecond = 0;
      }

      // Attack speed buff decay
      for (let b = hero.attackSpeedBuffs.length - 1; b >= 0; b--) {
        hero.attackSpeedBuffs[b].duration -= dt;
        if (hero.attackSpeedBuffs[b].duration <= 0) {
          hero.attackSpeedBuffs.splice(b, 1);
          this.recalculateHeroStats(hero);
        }
      }

      // Shield decay
      if (hero.shield > 0) {
        hero.shieldDuration -= dt;
        if (hero.shieldDuration <= 0) {
          hero.shield = 0;
        }
      }

      // Cooldown decrements
      if (hero.attackCooldown > 0) hero.attackCooldown -= dt;
      if (hero.activeSkillCooldown > 0) hero.activeSkillCooldown -= dt;
      if (hero.ultimateCooldown > 0) hero.ultimateCooldown -= dt;

      // Targeting
      const target = this.findBestTargetForHero(hero);
      if (target && hero.attackCooldown <= 0) {
        this.heroBasicAttack(hero, target);
      }

      // Auto-trigger Active Skill if ready & energy available
      const template = HERO_REGISTRY[hero.templateId];
      if (
        hero.activeSkillCooldown <= 0 &&
        hero.energy >= template.activeSkillCost &&
        this.enemies.length > 0
      ) {
        this.castHeroSkill(hero);
      }

      // Auto-trigger Ultimate if 100 energy reached & CD ready
      if (hero.energy >= 100 && hero.ultimateCooldown <= 0 && this.enemies.length > 0) {
        this.castHeroUltimate(hero);
      }
    }
  }

  private findBestTargetForHero(hero: HeroInstance): EnemyInstance | null {
    const validEnemies = this.enemies.filter((e) => {
      // Mist Stalker stealth rule (PRD D4): undetectable beyond 2.0 tiles
      const dist = getDistance(hero.tileX, hero.tileY, e.tileX, e.tileY);
      if (dist > hero.range) return false;
      if ((e.statuses.stealthDuration ?? 0) > 0 && dist > 2.0) {
        return false;
      }
      return true;
    });

    if (validEnemies.length === 0) return null;

    // PRD v3.0 Section 18 Targeting System (First, Last, Closest, Strongest, Lowest HP)
    const priority = hero.customTargetPriority || HERO_REGISTRY[hero.templateId].targetPriority || 'CLOSEST';

    if (priority === 'STRONGEST') {
      // Strongest: Highest HP -> DEF -> lower entity ID
      validEnemies.sort((a, b) => {
        if (b.currentHP !== a.currentHP) return b.currentHP - a.currentHP;
        if (b.defense !== a.defense) return b.defense - a.defense;
        return a.instanceId - b.instanceId;
      });
      return validEnemies[0];
    }

    if (priority === 'WEAKEST') {
      // Lowest HP -> lowest entity ID
      validEnemies.sort((a, b) => {
        if (a.currentHP !== b.currentHP) return a.currentHP - b.currentHP;
        return a.instanceId - b.instanceId;
      });
      return validEnemies[0];
    }

    if (priority === 'CLOSEST') {
      // Closest distance to hero
      validEnemies.sort((a, b) => {
        const distA = getDistance(hero.tileX, hero.tileY, a.tileX, a.tileY);
        const distB = getDistance(hero.tileX, hero.tileY, b.tileX, b.tileY);
        if (distA !== distB) return distA - distB;
        return a.instanceId - b.instanceId;
      });
      return validEnemies[0];
    }

    if (priority === 'LAST') {
      // Last: Lowest distance traveled along path
      validEnemies.sort((a, b) => {
        if (a.distanceTraveled !== b.distanceTraveled) return a.distanceTraveled - b.distanceTraveled;
        return a.instanceId - b.instanceId;
      });
      return validEnemies[0];
    }

    // Default: FIRST (greatest distance traveled along path -> entity ID)
    validEnemies.sort((a, b) => {
      if (b.distanceTraveled !== a.distanceTraveled) return b.distanceTraveled - a.distanceTraveled;
      return a.instanceId - b.instanceId;
    });
    return validEnemies[0];
  }

  private heroBasicAttack(hero: HeroInstance, target: EnemyInstance): void {
    const template = HERO_REGISTRY[hero.templateId];
    hero.attackCooldown = 1.0 / hero.effectiveAS;

    // Energy gain: 3 per basic hit, capped at 20/sec (PRD PC-03, BalanceConfig)
    this.grantHeroEnergy(hero, BALANCE_CONFIG.heroSkills.energy.basicAttackGain);

    const critStats = getCritStats(hero.rarity);
    const isCrit = this.rng.testChance(critStats.chance);

    // Create projectile
    this.projectiles.push({
      id: this.nextProjectileId++,
      sourceHeroId: hero.instanceId,
      targetEnemyId: target.instanceId,
      element: hero.element,
      damage: hero.effectiveATK,
      isCrit,
      speed: 8.0, // tiles per second
      x: hero.tileX,
      y: hero.tileY,
      targetX: target.tileX,
      targetY: target.tileY,
    });

    // Visual Attack Beam
    this.attackBeams.push({
      id: this.nextEntityId++,
      fromX: hero.tileX + 0.5,
      fromY: hero.tileY + 0.5,
      toX: target.tileX,
      toY: target.tileY,
      element: hero.element,
      duration: 0.12,
      maxDuration: 0.12,
    });
  }

  public grantHeroEnergy(hero: HeroInstance, amount: number): void {
    if (hero.isDead) return;
    const allowed = Math.max(0, BALANCE_CONFIG.heroSkills.energy.perHeroPerSecondCap - hero.energyGainThisSecond);
    const toAdd = Math.min(amount, allowed);
    hero.energy = Math.min(100, hero.energy + toAdd);
    hero.energyGainThisSecond += toAdd;
  }

  public castHeroSkill(hero: HeroInstance): void {
    const template = HERO_REGISTRY[hero.templateId];
    if (hero.energy < template.activeSkillCost || hero.activeSkillCooldown > 0) return;

    hero.energy -= template.activeSkillCost;
    hero.activeSkillCooldown = template.activeSkillCooldown;

    const isLv5 = hero.level >= 5;

    // Specific hero skill implementations
    if (hero.templateId === 'Pyra') {
      // Flame Dash: 180% (220% at Lv5) ATK to target cluster + Burn
      const target = this.findBestTargetForHero(hero);
      if (target) {
        const mul = isLv5 ? 2.20 : 1.80;
        this.applyHeroDamageToEnemy(hero, target, hero.effectiveATK * mul, false, 'Flame Dash');
        this.applyBurnStack(target, hero.instanceId, hero.effectiveATK);
      }
    } else if (hero.templateId === 'Bronn') {
      // Ground Slam: 180% (220% at Lv5) ATK + Root 1.5s + Earth Mark (PRD A1)
      const target = this.findBestTargetForHero(hero);
      if (target) {
        const mul = isLv5 ? 2.20 : 1.80;
        this.applyHeroDamageToEnemy(hero, target, hero.effectiveATK * mul, false, 'Ground Slam');
        this.applyRoot(target, 1.5);
        this.applyEarthMark(target);
      }
    } else if (hero.templateId === 'Terra') {
      // Mountain Rise / Earth Wall: places Earth Wall if path validation passes
      const adjacentTile = this.findAdjacentPathTile(hero.tileX, hero.tileY);
      const enemyPositions = this.enemies.map((e) => ({ x: e.tileX, y: e.tileY }));
      const isValid = adjacentTile
        ? validateEarthWallPlacement(adjacentTile.x, adjacentTile.y, this.earthWalls, enemyPositions)
        : false;

      if (isValid && adjacentTile) {
        const wallHP = isLv5 ? 6000 : 5000;
        this.earthWalls.push({
          id: `wall_${this.nextEntityId++}`,
          tileX: adjacentTile.x,
          tileY: adjacentTile.y,
          currentHP: wallHP,
          maxHP: wallHP,
        });
        this.addLog(`Terra raised an Earth Wall (${wallHP} HP) at (${adjacentTile.x}, ${adjacentTile.y})!`, 'skill');
      } else {
        // Refund energy and cooldown if placement invalid (PRD C5)
        hero.energy += template.activeSkillCost;
        hero.activeSkillCooldown = 0;
        return;
      }
    } else if (hero.templateId === 'Roota') {
      // Root Trap: 100% (130% at Lv5) ATK + Root 3s + Earth Mark (PRD A1)
      const target = this.findBestTargetForHero(hero);
      if (target) {
        const mul = isLv5 ? 1.30 : 1.00;
        this.applyHeroDamageToEnemy(hero, target, hero.effectiveATK * mul, false, 'Root Trap');
        this.applyRoot(target, 3.0);
        this.applyEarthMark(target);
      }
    } else if (hero.templateId === 'Aqua') {
      // Sanctuary: adjacent allies +20% (+25% at Lv5) AS for 8s
      const asBonus = isLv5 ? 0.25 : 0.20;
      for (const other of this.heroes) {
        if (!other.isDead && getDistance(hero.tileX, hero.tileY, other.tileX, other.tileY) <= 3.0) {
          other.attackSpeedBuffs.push({ percent: asBonus, duration: 8.0, source: 'Aqua.Sanctuary' });
          this.recalculateHeroStats(other);
        }
      }
      this.addLog(`Aqua cast Sanctuary: +${asBonus * 100}% AS to nearby allies!`, 'skill');
    } else if (hero.templateId === 'Tempest') {
      // Storm Field: 100%/sec (120% at Lv5) area zone for 6s + pull
      const target = this.findBestTargetForHero(hero);
      if (target) {
        const dps = hero.effectiveATK * (isLv5 ? 1.20 : 1.00);
        this.activeZones.push({
          id: this.nextZoneId++,
          name: 'Storm Field',
          element: 'Wind',
          x: target.tileX,
          y: target.tileY,
          radius: 2.0,
          damagePerTick: dps * 0.5, // 0.5s ticks
          remainingDuration: 6.0,
          tickInterval: 0.5,
          tickTimer: 0.5,
          pullDisplacement: 0.75 * 0.5,
          pullAccumulated: 0,
        });
        this.addLog(`Tempest manifested Storm Field!`, 'skill');
      }
    } else {
      // General skill default: deals 200% ATK damage to best target
      const target = this.findBestTargetForHero(hero);
      if (target) {
        this.applyHeroDamageToEnemy(hero, target, hero.effectiveATK * 2.0, false, template.activeSkillName);
      }
    }
  }

  public castHeroUltimate(hero: HeroInstance): void {
    const template = HERO_REGISTRY[hero.templateId];
    if (hero.energy < 100 || hero.ultimateCooldown > 0) return;

    hero.energy = 0;
    // Hero cooldown override (e.g. Pyra 25s, PRD PC-04 & BalanceConfig)
    hero.ultimateCooldown = BALANCE_CONFIG.heroUltimates.cooldownOverrides[hero.templateId] ??
      BALANCE_CONFIG.heroUltimates.defaultInternalCooldown;

    const isLv10 = hero.level >= 10;
    this.addLog(`ULTIMATE: ${hero.name} unleashed ${template.ultimateName}!`, 'skill');

    if (hero.templateId === 'Pyra') {
      // Burning Bloom: Detonates burns on all enemies for 350% ATK
      for (const e of this.enemies) {
        if (e.statuses.burns.length > 0) {
          const dmg = hero.effectiveATK * 3.5;
          this.applyHeroDamageToEnemy(hero, e, dmg, true, 'Burning Bloom');
        }
      }
    } else if (hero.templateId === 'Volkar') {
      // Volcanic Judgment: 800% ATK to strongest enemy (+45% bonus if <30% HP)
      const target = this.findBestTargetForHero(hero);
      if (target) {
        let mul = 8.0;
        if (target.currentHP / target.maxHP < 0.30) {
          mul += isLv10 ? 0.45 : 0.35;
        }
        this.applyHeroDamageToEnemy(hero, target, hero.effectiveATK * mul, true, 'Volcanic Judgment');
      }
    } else if (hero.templateId === 'Gaia') {
      // Continental Shield: 15% (18% at Lv5) Max HP shield to all allies
      const shieldPct = hero.level >= 5 ? 0.18 : 0.15;
      for (const h of this.heroes) {
        if (!h.isDead) {
          const shieldVal = roundHalfUp(h.maxHP * shieldPct);
          h.shield = Math.min(h.maxHP, h.shield + shieldVal);
          h.shieldDuration = 6.0;
        }
      }
      this.addLog(`Gaia granted Continental Shields (${shieldPct * 100}%) to all heroes!`, 'skill');
    } else {
      // AoE damage ultimate to all enemies within 3 tiles of best target
      const target = this.findBestTargetForHero(hero);
      if (target) {
        const radius = 3.0;
        for (const e of this.enemies) {
          if (getDistance(target.tileX, target.tileY, e.tileX, e.tileY) <= radius) {
            this.applyHeroDamageToEnemy(hero, e, hero.effectiveATK * 4.0, true, template.ultimateName);
          }
        }
      }
    }
  }

  private findAdjacentPathTile(x: number, y: number): { x: number; y: number } | null {
    const candidates = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];
    for (const c of candidates) {
      for (const path of LANE_PATHS) {
        if (path.some((pt) => pt.x === c.x && pt.y === c.y)) {
          return c;
        }
      }
    }
    return null;
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const target = this.enemies.find((e) => e.instanceId === p.targetEnemyId);

      if (!target) {
        this.projectiles.splice(i, 1);
        continue;
      }

      const dx = target.tileX - p.x;
      const dy = target.tileY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = p.speed * dt;

      if (dist <= step) {
        // Projectile hit!
        const hero = this.heroes.find((h) => h.instanceId === p.sourceHeroId);
        if (hero) {
          // Shadow Bat elite evasion check (PRD D3: 15% deterministic evasion)
          if (target.eliteMechanic === 'ShadowBat' && this.rng.testChance(0.15)) {
            this.addFloatingNumber('Evaded', target.tileX, target.tileY, '#94a3b8');
          } else {
            this.applyHeroDamageToEnemy(hero, target, p.damage, p.isCrit);
            const elemColor = hero.element === 'Fire' ? '#f97316' : hero.element === 'Water' ? '#06b6d4' : hero.element === 'Earth' ? '#84cc16' : '#a855f7';
            this.addParticleBurst(target.tileX, target.tileY, elemColor, p.isCrit ? 12 : 5, p.isCrit ? 4.5 : 2.5);
            if (p.isCrit) {
              sound.playCritHit();
              this.screenShakeTimer = 0.15;
            }
          }
        }
        this.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
    }
  }

  private updateActiveZones(dt: number): void {
    for (let i = this.activeZones.length - 1; i >= 0; i--) {
      const zone = this.activeZones[i];
      zone.remainingDuration -= dt;
      zone.tickTimer -= dt;

      if (zone.tickTimer <= 0) {
        zone.tickTimer = zone.tickInterval; // 0.5s

        // Find enemies in radius
        for (const e of this.enemies) {
          const dist = getDistance(zone.x, zone.y, e.tileX, e.tileY);
          if (dist <= zone.radius) {
            // Apply zone damage tick (PRD PC-06, B8)
            const dmgResult = calculateFinalDamage({
              baseDamage: zone.damagePerTick,
              attackerElement: zone.element,
              defenderElement: e.element,
              targetDefense: e.defense,
              isBossOrMiniBoss: e.enemyClass !== 'Normal' && e.enemyClass !== 'Elite',
            });

            e.currentHP = Math.max(0, e.currentHP - dmgResult.finalMitigatedDamage);
            this.totalDamageDealt += dmgResult.finalMitigatedDamage;
            this.addFloatingNumber(`${dmgResult.finalMitigatedDamage}`, e.tileX, e.tileY, '#38bdf8');

            // Apply cumulative pull displacement if configured (capped at 3.0 tiles, PRD B7)
            if (zone.pullDisplacement && (zone.pullAccumulated ?? 0) < 3.0) {
              const isBoss = e.enemyClass !== 'Normal' && e.enemyClass !== 'Elite';
              const actualPull = calculatePullDisplacement(zone.pullDisplacement, zone.pullAccumulated ?? 0, isBoss);
              zone.pullAccumulated = (zone.pullAccumulated ?? 0) + actualPull;

              // Pull back along path
              e.pathIndex = Math.max(0, e.pathIndex - actualPull);
              const path = LANE_PATHS[e.laneIndex];
              const ptIdx = Math.min(path.length - 1, Math.floor(e.pathIndex));
              e.tileX = path[ptIdx].x;
              e.tileY = path[ptIdx].y;
            }
          }
        }
      }

      if (zone.remainingDuration <= 0) {
        this.activeZones.splice(i, 1);
      }
    }
  }

  private updateEnemies(dt: number): void {
    const enemiesToRemove: number[] = [];

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.currentHP <= 0) {
        enemiesToRemove.push(e.instanceId);
        continue;
      }

      // Status ticks
      // 1. Burn ticks (1 tick/sec, 5% source ATK/sec)
      for (let b = e.statuses.burns.length - 1; b >= 0; b--) {
        const burn = e.statuses.burns[b];
        burn.remainingTime -= dt;

        // Apply burn tick every 1.0s (measured via remainingTime integer boundaries)
        const tickDmg = roundHalfUp(burn.dps * dt);
        if (tickDmg > 0) {
          e.currentHP = Math.max(0, e.currentHP - tickDmg);
          this.totalDamageDealt += tickDmg;
        }

        if (burn.remainingTime <= 0) {
          e.statuses.burns.splice(b, 1);
        }
      }

      // 2. Slow decay
      if (e.statuses.slow) {
        e.statuses.slow.remainingTime -= dt;
        if (e.statuses.slow.remainingTime <= 0) {
          e.statuses.slow = undefined;
        }
      }

      // 3. Root decay (stops movement, enemy CAN attack and use skills, PRD A2)
      if (e.statuses.rootDuration !== undefined && e.statuses.rootDuration > 0) {
        e.statuses.rootDuration -= dt;
        if (e.statuses.rootDuration <= 0) {
          delete e.statuses.rootDuration;
        }
      }

      // 4. Stun decay (stops all)
      if (e.statuses.stunDuration !== undefined && e.statuses.stunDuration > 0) {
        e.statuses.stunDuration -= dt;
        if (e.statuses.stunDuration <= 0) {
          delete e.statuses.stunDuration;
        }
      }

      // 5. Earth Mark decay (5s duration, PRD A1)
      if (e.statuses.earthMarkDuration !== undefined && e.statuses.earthMarkDuration > 0) {
        e.statuses.earthMarkDuration -= dt;
        if (e.statuses.earthMarkDuration <= 0) {
          delete e.statuses.earthMarkDuration;
        }
      }

      // 6. Mist Stalker stealth cycle (PRD D4: active 3s every 10s)
      if (e.templateId === 'MistStalker') {
        if (!e.statuses.stealthDuration) {
          e.statuses.stealthDuration = 0;
        }
      }

      // Special unit mechanics
      this.updateSpecialEnemyMechanics(e, dt);

      // Movement & Attack
      const isStunned = (e.statuses.stunDuration ?? 0) > 0;
      const isRooted = (e.statuses.rootDuration ?? 0) > 0;

      // Enemy Attack Cooldown
      if (e.attackCooldown > 0) e.attackCooldown -= dt;

      // Check attack target: Hero occupying range -> Earth Wall occupying range -> Base (PRD A5)
      const targetAttack = this.findEnemyAttackTarget(e);

      if (targetAttack && !isStunned && e.attackCooldown <= 0) {
        // Perform attack
        this.enemyAttackTarget(e, targetAttack);
      } else if (!isRooted && !isStunned) {
        // Move along path
        let slowFactor = 1.0;
        if (e.statuses.slow) {
          slowFactor = 1.0 - Math.min(BALANCE_CONFIG.statusEffects.slow.maxPercent, e.statuses.slow.percent);
        }

        const moveStep = e.baseSpeed * slowFactor * dt;
        const path = LANE_PATHS[e.laneIndex];
        const newIndex = e.pathIndex + moveStep;

        // Check if approaching an Earth Wall
        const nextIntIndex = Math.min(path.length - 1, Math.ceil(newIndex));
        const nextWaypoint = path[nextIntIndex];
        const wall = this.earthWalls.find((w) => w.tileX === nextWaypoint.x && w.tileY === nextWaypoint.y);

        if (wall && wall.currentHP > 0 && newIndex >= nextIntIndex - 0.45) {
          // Blocked by earth wall: pause before entering wall and attack
          e.pathIndex = Math.min(e.pathIndex, nextIntIndex - 0.45);
          if (e.attackCooldown <= 0 && !isStunned) {
            this.enemyAttackWall(e, wall);
          }
        } else {
          e.pathIndex = newIndex;
          e.distanceTraveled += moveStep;

          // Smooth fractional coordinate interpolation between waypoints
          const currIdx = Math.floor(e.pathIndex);
          if (currIdx >= path.length - 1) {
            e.tileX = path[path.length - 1].x;
            e.tileY = path[path.length - 1].y;

            // Reached Base (PRD A4)
            const leakDmg = ENEMY_REGISTRY[e.templateId]?.leakDamage ?? 1;
            this.baseHP = Math.max(0, this.baseHP - leakDmg);
            this.addLog(`ALERT: ${e.name} breached the Base! -${leakDmg} Base HP (Remaining: ${this.baseHP}).`, 'leak');
            enemiesToRemove.push(e.instanceId);
            sound.playBaseHit();
            this.baseAlertFlashTimer = 0.6;
            this.screenShakeTimer = 0.45;

            if (this.baseHP <= 0) {
              this.phase = 'LEVEL_DEFEAT';
              sound.playDefeat();
              this.addLog(`LEVEL DEFEAT! The Command Core has fallen on Wave ${this.currentWaveInLevel} of Level ${this.currentLevel}.`, 'system');
            }
          } else {
            const p1 = path[currIdx];
            const p2 = path[currIdx + 1];
            const frac = e.pathIndex - currIdx;
            e.tileX = p1.x + (p2.x - p1.x) * frac;
            e.tileY = p1.y + (p2.y - p1.y) * frac;
          }
        }
      }
    }

    // Process enemy deaths & cleanup
    for (const id of enemiesToRemove) {
      this.handleEnemyDeath(id);
    }
  }

  private findEnemyAttackTarget(enemy: EnemyInstance): HeroInstance | EarthWallInstance | null {
    // 1. Hero in range
    for (const h of this.heroes) {
      if (!h.isDead && getDistance(enemy.tileX, enemy.tileY, h.tileX, h.tileY) <= enemy.range) {
        return h;
      }
    }
    // 2. Earth Wall in range
    for (const w of this.earthWalls) {
      if (w.currentHP > 0 && getDistance(enemy.tileX, enemy.tileY, w.tileX, w.tileY) <= enemy.range) {
        return w;
      }
    }
    return null;
  }

  private enemyAttackTarget(enemy: EnemyInstance, target: HeroInstance | EarthWallInstance): void {
    enemy.attackCooldown = 1.0 / enemy.attackSpeed;

    if ('currentHP' in target && 'instanceId' in target) {
      // Target is Hero
      const hero = target as HeroInstance;
      const dmgResult = calculateFinalDamage({
        baseDamage: enemy.attackDamage,
        attackerElement: enemy.element,
        defenderElement: hero.element,
        targetDefense: hero.effectiveDEF,
        damageTakenReduction: hero.level >= 10 ? 0.25 : 0.20, // Tank stone skin
      });

      // Shield absorbs first (PRD C3)
      let damageToApply = dmgResult.finalMitigatedDamage;
      if (hero.shield > 0) {
        const absorbed = Math.min(hero.shield, damageToApply);
        hero.shield -= absorbed;
        damageToApply -= absorbed;
      }

      hero.currentHP = Math.max(0, hero.currentHP - damageToApply);
      this.addFloatingNumber(`${dmgResult.finalMitigatedDamage}`, hero.tileX, hero.tileY, '#ef4444');

      if (hero.currentHP <= 0) {
        hero.isDead = true;
        hero.energy = 0;
        this.addLog(`Hero ${hero.name} has fallen! Will revive next wave at 30% HP.`, 'system');
      }
    } else {
      // Target is Earth Wall
      const wall = target as EarthWallInstance;
      wall.currentHP = Math.max(0, wall.currentHP - enemy.attackDamage);
      this.addFloatingNumber(`${enemy.attackDamage}`, wall.tileX, wall.tileY, '#ca8a04');

      if (wall.currentHP <= 0) {
        this.earthWalls = this.earthWalls.filter((w) => w.id !== wall.id);
        this.addLog(`Earth Wall collapsed under enemy pressure!`, 'system');
      }
    }
  }

  private enemyAttackWall(enemy: EnemyInstance, wall: EarthWallInstance): void {
    enemy.attackCooldown = 1.0 / enemy.attackSpeed;
    wall.currentHP = Math.max(0, wall.currentHP - enemy.attackDamage);
    this.addFloatingNumber(`${enemy.attackDamage}`, wall.tileX, wall.tileY, '#ca8a04');

    if (wall.currentHP <= 0) {
      this.earthWalls = this.earthWalls.filter((w) => w.id !== wall.id);
      this.addLog(`Earth Wall destroyed at (${wall.tileX}, ${wall.tileY})!`, 'system');
    }
  }

  private updateSpecialEnemyMechanics(enemy: EnemyInstance, dt: number): void {
    // 1. Forest Healer (PRD D4: heals non-boss nearby allies 8% Max HP/sec, 1/sec tick)
    if (enemy.templateId === 'ForestHealer') {
      enemy.eliteMechanicState = (enemy.eliteMechanicState ?? 0) + dt;
      if (enemy.eliteMechanicState >= 1.0) {
        enemy.eliteMechanicState = 0;
        for (const other of this.enemies) {
          if (
            other.instanceId !== enemy.instanceId &&
            other.enemyClass !== 'Boss' &&
            other.enemyClass !== 'MapBoss' &&
            getDistance(enemy.tileX, enemy.tileY, other.tileX, other.tileY) <= 3.0
          ) {
            const healVal = roundHalfUp(other.maxHP * 0.08);
            other.currentHP = Math.min(other.maxHP, other.currentHP + healVal);
          }
        }
      }
    }

    // 2. Root Summoner (PRD D4: every 8s summons 2 Crawlers, max 4 active, 0 reward)
    if (enemy.templateId === 'RootSummoner') {
      enemy.eliteMechanicState = (enemy.eliteMechanicState ?? 0) + dt;
      if (enemy.eliteMechanicState >= 8.0) {
        enemy.eliteMechanicState = 0;
        const currentSummoned = this.enemies.filter((e) => e.templateId === 'ForestCrawler' && e.goldReward === 0).length;
        if (currentSummoned < 4) {
          this.spawnEnemy('ForestCrawler', false, enemy.laneIndex);
          this.spawnEnemy('ForestCrawler', false, enemy.laneIndex);
          // Set reward to 0 for summoned
          for (const s of this.enemies.slice(-2)) {
            s.goldReward = 0;
          }
          this.addLog(`Root Summoner conjured 2 Crawlers!`, 'system');
        }
      }
    }

    // 3. Boss Phases (PRD D2)
    if (enemy.enemyClass === 'MiniBoss' || enemy.enemyClass === 'Boss' || enemy.enemyClass === 'MapBoss') {
      const hpPct = enemy.currentHP / enemy.maxHP;
      enemy.bossSpecialTimer = (enemy.bossSpecialTimer ?? 0) + dt;

      // Mini Boss: Ancient Root Tyrant
      if (enemy.templateId === 'AncientRootTyrant') {
        if (hpPct < 0.60 && enemy.bossPhase === 1) {
          enemy.bossPhase = 2;
          this.addLog(`Mini Boss entered Phase 2: Root Slam unlocked!`, 'boss');
          for (const h of this.heroes) this.grantHeroEnergy(h, 15);
        } else if (hpPct < 0.30 && enemy.bossPhase === 2) {
          enemy.bossPhase = 3;
          enemy.attackSpeed = enemy.attackSpeed * 1.25;
          this.addLog(`Mini Boss entered Phase 3: Enraged (+25% Attack Speed)!`, 'boss');
          for (const h of this.heroes) this.grantHeroEnergy(h, 15);
        }

        // Root Slam every 10s (8s in Phase 3)
        const slamCD = enemy.bossPhase === 3 ? 8 : 10;
        if (enemy.bossPhase && enemy.bossPhase >= 2 && enemy.bossSpecialTimer >= slamCD) {
          enemy.bossSpecialTimer = 0;
          for (const h of this.heroes) {
            if (!h.isDead && getDistance(enemy.tileX, enemy.tileY, h.tileX, h.tileY) <= 2.0) {
              h.currentHP = Math.max(0, h.currentHP - enemy.attackDamage * 2.0);
            }
          }
          this.addLog(`Ancient Root Tyrant executed Root Slam (200% ATK in 2 tiles)!`, 'boss');
        }
      }

      // Boss: Flame Warden
      if (enemy.templateId === 'FlameWarden') {
        if (hpPct < 0.70 && enemy.bossPhase === 1) {
          enemy.bossPhase = 2;
          this.addLog(`Flame Warden entered Phase 2: Inferno Slam active!`, 'boss');
          for (const h of this.heroes) this.grantHeroEnergy(h, 15);
        } else if (hpPct < 0.40 && enemy.bossPhase === 2) {
          enemy.bossPhase = 3;
          enemy.attackSpeed = enemy.attackSpeed * 1.20;
          this.addLog(`Flame Warden entered Phase 3: Inferno Frenzy (+20% AS)!`, 'boss');
          for (const h of this.heroes) this.grantHeroEnergy(h, 15);
        }
      }
    }
  }

  public applyHeroDamageToEnemy(
    hero: HeroInstance,
    enemy: EnemyInstance,
    rawBaseDamage: number,
    isCrit: boolean = false,
    attackName?: string
  ): void {
    const isBoss = enemy.enemyClass === 'MiniBoss' || enemy.enemyClass === 'Boss' || enemy.enemyClass === 'MapBoss';

    const dmgResult = calculateFinalDamage({
      baseDamage: rawBaseDamage,
      attackerElement: hero.element,
      defenderElement: enemy.element,
      isCrit,
      critDamageMultiplier: getCritStats(hero.rarity).damage,
      targetDefense: enemy.defense,
      isBossOrMiniBoss: isBoss,
    });

    const finalDamage = dmgResult.finalMitigatedDamage;
    enemy.currentHP = Math.max(0, enemy.currentHP - finalDamage);
    hero.damageDealt += finalDamage;
    this.totalDamageDealt += finalDamage;

    // Record 10s window pre-mitigation contribution (PRD A7)
    const currentTimestamp = this.tick * BALANCE_CONFIG.globalCaps.fixedTimestep;
    this.synergyManager.recordContribution(hero.element, dmgResult.rawDamage, currentTimestamp);

    // Visual floating numbers
    const color = hero.element === 'Fire' ? '#f97316' : hero.element === 'Water' ? '#06b6d4' : hero.element === 'Earth' ? '#84cc16' : '#a855f7';
    this.addFloatingNumber(`${finalDamage}${isCrit ? '!' : ''}`, enemy.tileX, enemy.tileY, color, isCrit);

    // Energy on boss hit (PRD Section 8: 2 energy)
    if (isBoss) {
      this.grantHeroEnergy(hero, BALANCE_CONFIG.heroSkills.energy.bossHitGain);
    }

    // Synergy trigger check (PRD A7)
    const synergy = this.synergyManager.checkSynergyTrigger(
      enemy,
      hero.element,
      this.heroes,
      this.tick
    );

    if (synergy) {
      enemy.currentHP = Math.max(0, enemy.currentHP - synergy.damage);
      this.totalDamageDealt += synergy.damage;
      this.synergyManager.recordSynergySplitContribution(synergy.elements, synergy.damage, currentTimestamp);
      this.addFloatingNumber(`${synergy.damage} [${synergy.synergyName}]`, enemy.tileX, enemy.tileY, '#eab308', true);
      this.addLog(synergy.message, 'synergy');

      // Secondary synergy effect
      if (synergy.effectType === 'root') {
        this.applyRoot(enemy, synergy.effectValue);
      } else if (synergy.effectType === 'slow') {
        this.applySlow(enemy, synergy.effectValue, 3.0);
      }
    }
  }

  public applyBurnStack(enemy: EnemyInstance, sourceHeroId: string, heroATK: number): void {
    const dps = heroATK * BALANCE_CONFIG.statusEffects.burn.damagePerSecondPercentSourceATK; // 5% ATK
    const maxStacks = BALANCE_CONFIG.statusEffects.burn.maxStacksGlobalPerEnemy; // 3

    if (enemy.statuses.burns.length < maxStacks) {
      enemy.statuses.burns.push({
        sourceHeroId,
        dps,
        remainingTime: BALANCE_CONFIG.statusEffects.burn.duration, // 4s
      });
    } else {
      // PRD C2: Replace stack with earliest expiration
      let earliestIdx = 0;
      let minRemaining = enemy.statuses.burns[0].remainingTime;
      for (let i = 1; i < enemy.statuses.burns.length; i++) {
        if (enemy.statuses.burns[i].remainingTime < minRemaining) {
          minRemaining = enemy.statuses.burns[i].remainingTime;
          earliestIdx = i;
        }
      }
      enemy.statuses.burns[earliestIdx] = {
        sourceHeroId,
        dps,
        remainingTime: BALANCE_CONFIG.statusEffects.burn.duration,
      };
    }
  }

  public applySlow(enemy: EnemyInstance, percent: number, duration: number): void {
    const isBoss = enemy.enemyClass === 'MiniBoss' || enemy.enemyClass === 'Boss' || enemy.enemyClass === 'MapBoss';
    const finalDuration = calculateCCDuration(duration, isBoss, 'slow');
    const clampedPercent = Math.min(BALANCE_CONFIG.statusEffects.slow.maxPercent, percent);

    if (!enemy.statuses.slow || clampedPercent >= enemy.statuses.slow.percent) {
      enemy.statuses.slow = {
        percent: clampedPercent,
        remainingTime: finalDuration,
      };
    } else {
      // Refresh duration
      enemy.statuses.slow.remainingTime = Math.max(enemy.statuses.slow.remainingTime, finalDuration);
    }
  }

  public applyRoot(enemy: EnemyInstance, duration: number): void {
    const isBoss = enemy.enemyClass === 'MiniBoss' || enemy.enemyClass === 'Boss' || enemy.enemyClass === 'MapBoss';
    const finalDuration = calculateCCDuration(duration, isBoss, 'root');
    enemy.statuses.rootDuration = Math.max(enemy.statuses.rootDuration ?? 0, finalDuration);
  }

  public applyStun(enemy: EnemyInstance, duration: number): void {
    const isBoss = enemy.enemyClass === 'MiniBoss' || enemy.enemyClass === 'Boss' || enemy.enemyClass === 'MapBoss';
    const finalDuration = calculateCCDuration(duration, isBoss, 'stun');
    enemy.statuses.stunDuration = Math.max(enemy.statuses.stunDuration ?? 0, finalDuration);
  }

  public applyEarthMark(enemy: EnemyInstance): void {
    // 5s duration, max 1 stack, refresh on reapplication (PRD A1)
    enemy.statuses.earthMarkDuration = BALANCE_CONFIG.heroSkills.earthMark.duration;
  }

  public addParticleBurst(x: number, y: number, color: string, count: number = 10, speed: number = 3): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const spd = speed * (0.6 + Math.random() * 0.8);
      this.particles.push({
        id: this.nextParticleId++,
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: 2 + Math.random() * 3,
        lifetime: 0.4 + Math.random() * 0.35,
        maxLifetime: 0.75,
      });
    }
  }

  public callWaveEarly(): number | null {
    if (this.phase !== 'PREPARATION') return null;
    const bonus = Math.max(25, Math.ceil(this.preparationTimer * 15));
    this.addPlayerGold(bonus);
    this.addFloatingNumber(`+${bonus} EARLY BONUS!`, 10.5, 3.8, '#fbbf24', true);
    this.addLog(`Commander initiated Early Wave assault! Earned +${bonus} tactical gold bonus.`, 'system');
    sound.playWaveHorn();
    this.startCombatPhase();
    return bonus;
  }

  public useOrbitalStrike(tileX: number, tileY: number): boolean {
    if (this.commanderCooldowns.orbitalStrike > 0) return false;
    this.commanderCooldowns.orbitalStrike = 22.0;

    sound.playOrbitalStrike();
    this.screenShakeTimer = 0.5;

    // Visual beam descending from sky
    this.attackBeams.push({
      id: this.nextEntityId++,
      fromX: tileX,
      fromY: -1.5,
      toX: tileX,
      toY: tileY,
      element: 'Fire',
      duration: 0.45,
      maxDuration: 0.45,
    });

    const avgAtk = this.heroes.length > 0
      ? this.heroes.reduce((sum, h) => sum + h.effectiveATK, 0) / this.heroes.length
      : 120;
    const dmg = Math.round(avgAtk * 5.0);

    const radius = 2.4;
    let hitCount = 0;
    for (const e of this.enemies) {
      if (getDistance(tileX, tileY, e.tileX, e.tileY) <= radius) {
        e.currentHP = Math.max(0, e.currentHP - dmg);
        this.totalDamageDealt += dmg;
        this.applyStun(e, 2.0);
        this.addFloatingNumber(`${dmg} [ORBITAL]`, e.tileX, e.tileY, '#f97316', true);
        hitCount++;
      }
    }

    this.addParticleBurst(tileX, tileY, '#f97316', 28, 6.5);
    this.addParticleBurst(tileX, tileY, '#facc15', 20, 5.0);
    this.addLog(`COMMANDER: Orbital Strike detonated at (${tileX.toFixed(1)}, ${tileY.toFixed(1)}) hitting ${hitCount} foes!`, 'skill');
    return true;
  }

  public useBioBarrierOverdrive(): boolean {
    if (this.commanderCooldowns.bioBarrier > 0) return false;
    this.commanderCooldowns.bioBarrier = 28.0;

    sound.playShieldOvercharge();
    const healAmount = Math.min(25, 100 - this.baseHP);
    this.baseHP = Math.min(100, this.baseHP + 25);

    // Repel enemies within 4.5 tiles of Base
    const basePoint = { x: 10.5, y: 4.0 };
    let repelled = 0;
    for (const e of this.enemies) {
      if (getDistance(basePoint.x, basePoint.y, e.tileX, e.tileY) <= 4.5) {
        e.pathIndex = Math.max(0, e.pathIndex - 2.0);
        repelled++;
      }
    }

    this.addFloatingNumber(`+${healAmount}% CORE REPAIR`, 10.5, 3.5, '#4ade80', true);
    this.addParticleBurst(10.5, 4.0, '#4ade80', 25, 5.0);
    this.addLog(`COMMANDER: Bio-Barrier Overdrive engaged! Repelled ${repelled} hostiles and fortified Base Core (+${healAmount}% HP).`, 'skill');
    return true;
  }

  public useCryoFreezeWave(): boolean {
    if (this.commanderCooldowns.cryoFreeze > 0) return false;
    this.commanderCooldowns.cryoFreeze = 25.0;

    sound.playFreezeWave();
    const avgAtk = this.heroes.length > 0
      ? this.heroes.reduce((sum, h) => sum + h.effectiveATK, 0) / this.heroes.length
      : 120;
    const frostDmg = Math.round(avgAtk * 1.5);

    for (const e of this.enemies) {
      e.currentHP = Math.max(0, e.currentHP - frostDmg);
      this.totalDamageDealt += frostDmg;
      this.applySlow(e, 0.70, 5.0);
      this.addFloatingNumber(`${frostDmg} [FROST]`, e.tileX, e.tileY, '#38bdf8', false);
      this.addParticleBurst(e.tileX, e.tileY, '#38bdf8', 6, 2.5);
    }

    this.addLog(`COMMANDER: Cryo Blizzard Wave deployed! All hostiles deep-frozen (70% slow for 5s).`, 'skill');
    return true;
  }

  public useGoldDroneHarvest(): boolean {
    if (this.commanderCooldowns.droneHarvest > 0) return false;
    this.commanderCooldowns.droneHarvest = 30.0;

    sound.playCoinClink();
    const bonus = 120 + this.wave * 12;
    this.addPlayerGold(bonus);
    this.addFloatingNumber(`+${bonus} GOLD DRONES`, 10.5, 3.2, '#facc15', true);
    this.addParticleBurst(10.5, 4.0, '#facc15', 18, 4.0);
    this.addLog(`COMMANDER: Autonomous Harvest Drones returned with +${bonus} Gold resources!`, 'system');
    return true;
  }

  private handleEnemyDeath(enemyId: number): void {
    const idx = this.enemies.findIndex((e) => e.instanceId === enemyId);
    if (idx === -1) return;

    const enemy = this.enemies[idx];
    this.enemies.splice(idx, 1);
    this.totalEnemiesDefeated++;

    sound.playEnemyDeath();
    const deathColor = enemy.element === 'Fire' ? '#f97316' : enemy.element === 'Water' ? '#06b6d4' : enemy.element === 'Earth' ? '#84cc16' : '#a855f7';
    this.addParticleBurst(enemy.tileX, enemy.tileY, deathColor, 10, 3.2);

    // Grant gold reward to players
    this.addPlayerGold(enemy.goldReward);

    // Grant Energy to all active heroes (PRD Section 8)
    const isBoss = enemy.enemyClass === 'MiniBoss' || enemy.enemyClass === 'Boss' || enemy.enemyClass === 'MapBoss';
    const isElite = enemy.enemyClass === 'Elite';
    const gain = isBoss
      ? BALANCE_CONFIG.heroSkills.energy.bossPhaseTransitionGain
      : isElite
      ? BALANCE_CONFIG.heroSkills.energy.eliteKillGain
      : BALANCE_CONFIG.heroSkills.energy.killGain;

    for (const h of this.heroes) {
      this.grantHeroEnergy(h, gain);
    }

    this.addLog(`Defeated ${enemy.name}! (+${enemy.goldReward} Gold)`, 'kill');
  }

  /**
   * Elemental Burst ability trigger (PRD A7).
   * Cooldown 30s, AoE 4 tiles, 400% CombinedAverageATK.
   * Lowest contribution element in last 10s selects secondary effect.
   */
  public triggerElementalBurst(): boolean {
    if (!this.synergyManager.isBurstReady() || this.heroes.length === 0) return false;

    const currentTimestamp = this.tick * BALANCE_CONFIG.globalCaps.fixedTimestep;
    const lowestElement = this.synergyManager.getLowestContributionElement(currentTimestamp);
    const avgATK = this.synergyManager.calculateCombinedAverageATK(this.heroes, ['Fire', 'Water', 'Earth', 'Wind']);

    const burstDamage = roundHalfUp(avgATK * BALANCE_CONFIG.synergy.elementalBurst.baseMultiplier); // 400%
    this.synergyManager.triggerBurstCooldown();

    // Damage all active enemies
    for (const e of this.enemies) {
      e.currentHP = Math.max(0, e.currentHP - burstDamage);
      this.totalDamageDealt += burstDamage;
      this.addFloatingNumber(`${burstDamage} [BURST]`, e.tileX, e.tileY, '#fbbf24', true);

      // Element-specific secondary effect (PRD A7)
      if (lowestElement === 'Fire') {
        this.applyBurnStack(e, 'BURST', avgATK);
        this.applyBurnStack(e, 'BURST', avgATK);
      } else if (lowestElement === 'Water') {
        this.applySlow(e, 0.50, 4.0);
      } else if (lowestElement === 'Earth') {
        this.applyEarthMark(e);
        const isBoss = e.enemyClass !== 'Normal' && e.enemyClass !== 'Elite';
        e.statuses.stunDuration = isBoss ? 1.0 : 1.0;
      } else if (lowestElement === 'Wind') {
        this.applySlow(e, 0.30, 3.0);
        // Pull 2 tiles
        e.pathIndex = Math.max(0, e.pathIndex - 2.0);
      }
    }

    if (lowestElement === 'Water') {
      // Heal allies 15% Max HP
      for (const h of this.heroes) {
        if (!h.isDead) {
          h.currentHP = Math.min(h.maxHP, roundHalfUp(h.currentHP + h.maxHP * 0.15));
        }
      }
    }

    this.addLog(`ELEMENTAL BURST ACTIVATED! Infused with ${lowestElement} energy for ${burstDamage} damage!`, 'burst');
    return true;
  }

  private checkWaveCompletion(): void {
    if (this.currentWaveSpawnQueue.length === 0 && this.enemies.length === 0) {
      // Wave Cleared within this level!
      const levelCfg = CAMPAIGN_LEVELS[this.currentLevel] || CAMPAIGN_LEVELS[1];
      const waveReward = BALANCE_CONFIG.economy.waveRewardBase + this.wave * BALANCE_CONFIG.economy.waveRewardPerWave;
      this.addPlayerGold(waveReward);
      this.addLog(`Wave ${this.currentWaveInLevel}/${this.levelWavesCount} Cleared! Reward: +${waveReward} Gold!`, 'system');
      this.waveClearBanner = { wave: this.currentWaveInLevel, goldBonus: waveReward, duration: 3.5 };
      sound.playVictory();
      this.addParticleBurst(GRID_WIDTH / 2, GRID_HEIGHT / 2, '#38bdf8', 22, 5.5);
      this.addParticleBurst(GRID_WIDTH / 2, GRID_HEIGHT / 2, '#facc15', 22, 5.5);

      // Check if this was the final wave of the current Level
      if (this.currentWaveInLevel >= this.levelWavesCount) {
        // Calculate 3-Star Rating
        let stars = 1;
        if (this.baseHP >= 100) {
          stars = 3; // Flawless Base Defense
        } else if (this.baseHP >= (this.currentLevel >= 4 ? 60 : 70)) {
          stars = 2;
        }

        const score = this.baseHP * 10 + this.totalEnemiesDefeated * 30 + Math.round(this.totalDamageDealt / 80);
        const rewardGold = levelCfg.reward.gold;
        this.addPlayerGold(rewardGold);

        const baseLevel = progression.getProgress().baseLevel || 1;
        const maxBaseHP = BALANCE_CONFIG.baseStats.baseHP[baseLevel] || 100;
        const isFlawless = this.baseHP >= maxBaseHP;

        // Persist victory in progression storage
        const progResult = progression.completeLevel(
          this.currentLevel,
          stars,
          score,
          levelCfg.reward.xp,
          rewardGold,
          levelCfg.reward.crystals || 10,
          levelCfg.reward.badgeTitle,
          isFlawless
        );

        this.levelVictoryDetails = {
          levelNumber: this.currentLevel,
          stars,
          score,
          rewardGold,
          newlyUnlocked: progResult.newlyUnlockedNextLevel,
        };

        this.phase = 'LEVEL_VICTORY';
        sound.playLevelComplete();
        this.addLog(`VICTORY! ${levelCfg.name} CONQUERED with ${stars} STARS! (+${rewardGold} Level Bonus Gold)`, 'system');
      } else {
        // Advance to next wave in this level
        this.currentWaveInLevel++;
        const nextGlobalWave = Math.min(30, levelCfg.startWaveGlobalIndex + (this.currentWaveInLevel - 1));
        this.prepareWave(nextGlobalWave);
      }
    }
  }

  /**
   * Deterministic State Snapshotting (PRD A8, Section C7).
   */
  public createSnapshot(): GameStateSnapshot {
    const currentTimestamp = this.tick * BALANCE_CONFIG.globalCaps.fixedTimestep;
    return {
      version: BALANCE_CONFIG.balanceVersion,
      timestamp: Date.now(),
      rngSnapshot: this.rng.snapshot(),
      tick: this.tick,
      gameSpeed: this.gameSpeed,
      isPaused: this.isPaused,
      wave: this.wave,
      currentLevel: this.currentLevel,
      currentWaveInLevel: this.currentWaveInLevel,
      levelWavesCount: this.levelWavesCount,
      phase: this.phase,
      preparationTimer: this.preparationTimer,
      gold: this.gold,
      baseHP: this.baseHP,
      heroes: JSON.parse(JSON.stringify(this.heroes)),
      enemies: JSON.parse(JSON.stringify(this.enemies)),
      earthWalls: JSON.parse(JSON.stringify(this.earthWalls)),
      projectiles: JSON.parse(JSON.stringify(this.projectiles)),
      activeZones: JSON.parse(JSON.stringify(this.activeZones)),
      elementalBurstCooldown: this.synergyManager.getBurstCooldownRemaining(),
      elementContributionLast10s: this.synergyManager.getContributionsLast10s(currentTimestamp),
      activeSynergies: [],
      totalEnemiesDefeated: this.totalEnemiesDefeated,
      totalDamageDealt: this.totalDamageDealt,
    };
  }

  public loadSnapshot(snapshot: GameStateSnapshot): void {
    this.rng.restore(snapshot.rngSnapshot);
    this.tick = snapshot.tick;
    this.gameSpeed = snapshot.gameSpeed;
    this.isPaused = snapshot.isPaused;
    this.wave = snapshot.wave;
    this.currentLevel = snapshot.currentLevel || 1;
    this.currentWaveInLevel = snapshot.currentWaveInLevel || 1;
    this.levelWavesCount = snapshot.levelWavesCount || 5;
    this.phase = snapshot.phase;
    this.preparationTimer = snapshot.preparationTimer;
    this.gold = snapshot.gold;
    this.baseHP = snapshot.baseHP;
    this.heroes = JSON.parse(JSON.stringify(snapshot.heroes));
    this.enemies = JSON.parse(JSON.stringify(snapshot.enemies));
    this.earthWalls = JSON.parse(JSON.stringify(snapshot.earthWalls));
    this.projectiles = JSON.parse(JSON.stringify(snapshot.projectiles));
    this.activeZones = JSON.parse(JSON.stringify(snapshot.activeZones));
    this.totalEnemiesDefeated = snapshot.totalEnemiesDefeated;
    this.totalDamageDealt = snapshot.totalDamageDealt;

    // Reconstruct tactical slots occupation
    this.initializeSlots();
    for (const h of this.heroes) {
      const slot = this.tacticalSlots.find((s) => s.slotIndex === h.slotIndex);
      if (slot) slot.occupiedHeroInstanceId = h.instanceId;
    }

    this.addLog(`Loaded state from wave ${this.wave} (tick ${this.tick}).`, 'system');
  }
}

/**
 * Dedicated function to create a completely new battle session for a level and mode.
 * Completely discards the previous battlefield state and initializes clean defaults.
 */
export function createNewGameSession(
  levelId: number = 1,
  playerMode: 'single' | 'coop' = 'single',
  activePlayer: 'P1' | 'P2' = 'P1',
  seed?: bigint | number
): GameSimulation {
  const sim = new GameSimulation(seed ?? BigInt(Date.now()));
  sim.createNewGameSession(levelId, playerMode, activePlayer);
  return sim;
}
