/**
 * Elemental Wildguard - Game Data Types & Entity Structures
 * Fully compliant with PRD v2.2 specifications.
 */

export type Element = 'Fire' | 'Water' | 'Earth' | 'Wind';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
export type Role = 'Tank' | 'Melee' | 'Support' | 'Ranged';
export type EnemyClass = 'Normal' | 'Elite' | 'MiniBoss' | 'Boss' | 'MapBoss';

export type TargetPriority =
  | 'FIRST'
  | 'LAST'
  | 'STRONGEST'
  | 'LOWEST_HP_ALLY'
  | 'WATER_CONTROLLED'
  | 'CLOSEST'
  | 'WEAKEST';

export interface BurnStack {
  sourceHeroId: string;
  dps: number;
  remainingTime: number;
}

export interface EnemyStatusState {
  earthMarkDuration?: number; // 5s max 1 stack
  burns: BurnStack[]; // max 3 stacks global
  slow?: {
    percent: number; // max 0.80
    remainingTime: number;
  };
  rootDuration?: number; // stops movement, allows attack/skills, boss cap 1.5s
  stunDuration?: number; // stops all, boss cap 1.5s
  stealthDuration?: number; // for Mist Stalker
  attackSpeedDebuff?: {
    percent: number;
    remainingTime: number;
  };
  defenseBuff?: {
    percent: number;
    remainingTime: number;
  };
}

export type DamageType = 'Physical' | 'Magic' | 'Piercing' | 'Blunt' | 'Slashing';

export type ProjectileType =
  | 'fire_slash'
  | 'fire_orb'
  | 'solar_beam'
  | 'arrow_fire'
  | 'water_splash'
  | 'water_orb'
  | 'arrow_water'
  | 'water_whirlpool'
  | 'rock_spike'
  | 'boulder'
  | 'arrow_wind'
  | 'wind_blade'
  | 'wind_gust'
  | 'storm_bolt'
  | 'melee';

export type HeroSilhouette =
  | 'HeavyTank'
  | 'Colossus'
  | 'Warrior'
  | 'Mage'
  | 'SupportPriestess'
  | 'Ranger'
  | 'Assassin'
  | 'Brawler';

export type WeaponType =
  | 'Greatsword'
  | 'Warhammer'
  | 'Staff'
  | 'Trident'
  | 'Bow'
  | 'DualDaggers'
  | 'TowerShield'
  | 'Scepter'
  | 'Chakram'
  | 'Fans';

export interface HeroTemplate {
  id: string;
  name: string;
  element: Element;
  rarity: Rarity;
  role: Role;
  baseHP: number;
  baseATK: number;
  baseAS: number; // Attacks per second
  baseDEF: number;
  baseRange: number; // In tiles
  targetPriority: TargetPriority;

  // PRD Addendum Section 3: Hero Combat & Damage Profile
  criticalChance: number; // e.g. 0.15 = 15%
  criticalDamage: number; // e.g. 1.75 = 175%
  damageType: DamageType;
  targetCount: number; // 1: single, >1: cleave, 0: full splash
  splashRadius: number; // in tiles
  statusEffect: 'Burn' | 'Slow' | 'Stun' | 'ArmorBreak' | 'Knockback' | 'None';
  projectileType: ProjectileType;
  silhouette: HeroSilhouette;
  weaponType: WeaponType;
  attackVFX: string;
  impactVFX: string;
  attackSFX: string;

  // PRD Addendum Section 8-10: Hero Shop / Acquisition
  priceGold: number;
  priceCrystals: number;
  requiredPlayerLevel: number;

  activeSkillName: string;
  activeSkillCost: number; // Energy cost
  activeSkillCooldown: number; // Seconds
  activeSkillDescription: string;
  ultimateName: string;
  ultimateCooldown: number; // Seconds (default 5, Pyra 25)
  ultimateDescription: string;
  lore: string;
}

export interface HeroInstance {
  instanceId: string;
  templateId: string;
  name: string;
  element: Element;
  rarity: Rarity;
  role: Role;
  level: number; // 1 to 10
  slotIndex: number;
  tileX: number;
  tileY: number;

  currentHP: number;
  maxHP: number;
  baseATK: number;
  effectiveATK: number;
  baseAS: number;
  effectiveAS: number;
  baseDEF: number;
  effectiveDEF: number;
  range: number;

  // Combat profile
  criticalChance: number;
  criticalDamage: number;
  damageType: DamageType;
  targetCount: number;
  splashRadius: number;
  statusEffect: 'Burn' | 'Slow' | 'Stun' | 'ArmorBreak' | 'Knockback' | 'None';
  projectileType: ProjectileType;
  silhouette: HeroSilhouette;
  weaponType: WeaponType;

  energy: number; // 0 to 100
  energyGainThisSecond: number;
  secondTimer: number;

  attackCooldown: number;
  activeSkillCooldown: number;
  ultimateCooldown: number;

  isDead: boolean;
  kills: number;
  damageDealt: number;

  shield: number;
  shieldDuration: number;
  attackSpeedBuffs: Array<{ source: string; percent: number; duration: number }>;
  customTargetPriority?: TargetPriority;

  // Merge and 2-Player Co-op
  starLevel: number; // 1, 2, or 3 stars
  ownerPlayerId?: 'P1' | 'P2';
}

export interface ParticleInstance {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
}

export interface EnemyInstance {
  instanceId: number; // unique deterministic entity ID
  templateId: string;
  name: string;
  element: Element;
  enemyClass: EnemyClass;
  currentHP: number;
  maxHP: number;
  defense: number;
  baseSpeed: number; // tiles/second
  currentSpeed: number;
  attackSpeed: number;
  attackDamage: number;
  range: number;
  attackType: 'Melee' | 'Ranged';
  goldReward: number;

  laneIndex: number;
  pathIndex: number;
  tileX: number;
  tileY: number;
  distanceTraveled: number; // For FIRST target tie-breaker

  statuses: EnemyStatusState;
  attackCooldown: number;

  // Boss / Elite mechanics
  bossPhase?: number;
  bossSpecialTimer?: number;
  eliteMechanic?: string;
  eliteMechanicState?: any;
}

export interface EarthWallInstance {
  id: string;
  tileX: number;
  tileY: number;
  slotIndex?: number;
  currentHP: number;
  maxHP: number;
}

export interface ProjectileInstance {
  id: number;
  sourceHeroId: string;
  targetEnemyId: number;
  element: Element;
  damage: number;
  isCrit: boolean;
  speed: number; // tiles per second
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  splashRadius?: number;
  applyBurn?: boolean;
  applySlow?: { percent: number; duration: number };
  applyEarthMark?: boolean;
}

export interface ActiveZoneInstance {
  id: number;
  name: string;
  element: Element;
  x: number;
  y: number;
  radius: number;
  damagePerTick: number; // Calculated from dps * 0.5
  remainingDuration: number;
  tickInterval: number; // 0.5s
  tickTimer: number;
  slowPercent?: number;
  pullDisplacement?: number;
  pullAccumulated?: number; // Capped at 3.0 tiles
}

export interface FloatingDamageNumber {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  isCrit: boolean;
  opacity: number;
  lifetime: number;
}

export interface CombatLogEntry {
  id: number;
  tick: number;
  wave: number;
  message: string;
  type: 'synergy' | 'kill' | 'boss' | 'skill' | 'burst' | 'leak' | 'system';
}

export interface TacticalSlot {
  padId?: string; // Unique TowerPad ID e.g. 'PAD_01'
  slotIndex: number;
  tileX: number;
  tileY: number;
  terrainBonus?: Element;
  occupied?: boolean;
  towerId?: string | null;
  occupiedHeroInstanceId?: string;
  ownerPlayerId?: 'P1' | 'P2';
}

export type PlayerRole = 'P1' | 'P2';
export type GameMode = 'single' | 'coop';

export interface MultiplayerRoomState {
  roomCode: string;
  hostReady: boolean;
  guestReady: boolean;
  guestConnected: boolean;
  gameStarted: boolean;
  selectedLevel: number;
}

export type MultiplayerActionType =
  | 'ROOM_UPDATE'
  | 'GAME_START'
  | 'DEPLOY_HERO'
  | 'UPGRADE_HERO'
  | 'MERGE_HEROES'
  | 'SELL_HERO'
  | 'CAST_SKILL'
  | 'CAST_ULTIMATE'
  | 'START_WAVE'
  | 'CALL_EARLY_WAVE'
  | 'RESET_SESSION'
  | 'LEAVE_ROOM'
  | 'SYNC_SNAPSHOT';

export interface MultiplayerMessage {
  roomId: string;
  sender: PlayerRole;
  timestamp: number;
  type: MultiplayerActionType;
  payload?: any;
}

export interface GridPoint {
  x: number;
  y: number;
}

export interface GameStateSnapshot {
  version: string;
  timestamp: number;
  rngSnapshot: any;
  tick: number;
  gameSpeed: number;
  isPaused: boolean;
  wave: number;
  currentLevel?: number;
  currentWaveInLevel?: number;
  levelWavesCount?: number;
  phase: 'PREPARATION' | 'COMBAT' | 'VICTORY' | 'GAME_OVER' | 'LEVEL_VICTORY' | 'LEVEL_DEFEAT' | 'IDLE';
  preparationTimer: number;
  gold: number;
  baseHP: number;
  heroes: HeroInstance[];
  enemies: EnemyInstance[];
  earthWalls: EarthWallInstance[];
  projectiles: ProjectileInstance[];
  activeZones: ActiveZoneInstance[];
  elementalBurstCooldown: number;
  elementContributionLast10s: Record<Element, number>;
  activeSynergies: string[];
  totalEnemiesDefeated: number;
  totalDamageDealt: number;
}
