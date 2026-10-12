/**
 * Elemental Wildguard - Permanent Player Progression Storage v3.0
 * Compliant with PRD v3.0 Sections 4, 6, 12, 13, 16, 36-39, 41-50, 70, 71, 73.
 *
 * CRITICAL ARCHITECTURAL CONSTITUTION:
 * persistentProgress != runtimeMatchState
 */

import { CAMPAIGN_LEVELS } from '../data/levelRegistry';
import { BALANCE_CONFIG } from '../config/balanceConfig';

export interface MissionItem {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  current: number;
  target: number;
  rewardGold: number;
  rewardCrystals: number;
  rewardXP: number;
  claimed: boolean;
}

export interface AchievementItem {
  id: string;
  code: 'FIRST_GUARDIAN' | 'ELEMENTAL_MASTER' | 'UNBREAKABLE' | 'BOSS_HUNTER' | 'WILDCARD';
  title: string;
  description: string;
  current: number;
  target: number;
  rewardCrystals: number;
  rewardBadge: string;
  claimed: boolean;
}

export interface PlayerSettings {
  volume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  graphicsQuality: 'Low' | 'Medium' | 'High';
  screenShake: boolean;
  language: 'id' | 'en';
}

export interface PlayerProgress {
  // Player Level 1–100 (PRD v3.0 Section 41)
  playerLevel: number;
  currentXP: number;
  totalXP: number;

  // Economy (PRD v3.0 Section 44)
  gold: number;
  crystals: number;

  // Base Level 1–3 (PRD v3.0 Section 36-39)
  baseLevel: number; // 1, 2, or 3

  // Hero Levels 1–10 (PRD v3.0 Section 16)
  heroLevels: Record<string, number>; // heroId -> level (1-10)

  // Pre-configured Battle Squads (PRD v3.0 Section 12-13)
  // Single player: up to base capacity (6, 7, or 8)
  singlePlayerSquad: string[]; // Hero IDs, strictly NO duplicates
  // Multiplayer: 3 heroes per player
  multiplayerSquad: string[]; // Hero IDs, strictly NO duplicates

  // Stages & Stars
  unlockedLevels: number[]; // 1 to 10
  levelStars: Record<number, number>; // levelNumber -> 0, 1, 2, 3
  levelHighScores: Record<number, number>;

  // Missions & Achievements (PRD v3.0 Section 49, 50, 83)
  missions: MissionItem[];
  achievements: AchievementItem[];

  // Profile Statistics (PRD v3.0 Section 52)
  stats: {
    stagesCompletedCount: number;
    bossesDefeatedCount: number;
    totalWins: number;
    multiplayerWins: number;
    reactionsTriggered: number;
    perfectClearCount: number;
  };

  unlockedBadges: string[];
  unlockedHeroes: string[];
  // PRD Addendum Section 8-11: Owned Heroes Collection
  ownedHeroes: string[];
  // PRD Addendum Section 13-17: Level-Specific Hero Loadout Storage
  levelLoadouts: Record<number, string[]>;
  settings: PlayerSettings;
}

export interface MatchState {
  levelId: number;
  startingGold: number;
  p1Gold: number;
  p2Gold: number;
  coreHP: number;
  wave: number;
  currentWaveInLevel: number;
  totalWaves: number;
  phase: 'PREPARATION' | 'COMBAT' | 'VICTORY' | 'GAME_OVER' | 'LEVEL_VICTORY' | 'LEVEL_DEFEAT';
  towerLevelsReset: boolean;
  emptyEnemies: boolean;
  emptyProjectiles: boolean;
  defaultCooldowns: boolean;
  timestamp: number;
}

export const ALL_20_HERO_IDS = [
  // Fire (5)
  'Pyra',
  'Ignis',
  'Solara',
  'Ember',
  'Volkar',
  // Water (5)
  'Aqua',
  'Neria',
  'River',
  'Mira',
  'Abyss',
  // Earth (5)
  'Terra',
  'Bronn',
  'Roota',
  'Moss',
  'Gaia',
  // Wind (5)
  'Aeris',
  'Zephyr',
  'Luma',
  'Kai',
  'Tempest',
];

export const STARTER_OWNED_HEROES = ['Pyra', 'Aqua', 'Terra', 'Aeris', 'Bronn', 'Ignis'];

const DEFAULT_LEVEL_LOADOUTS: Record<number, string[]> = {
  1: ['Pyra', 'Aqua', 'Terra'],
  2: ['Aqua', 'Aeris', 'Terra'],
  3: ['Terra', 'Pyra', 'Ignis'],
  4: ['Aqua', 'Bronn', 'Pyra'],
  5: ['Terra', 'Aqua', 'Aeris'],
  6: ['Pyra', 'Aqua', 'Terra'],
  7: ['Terra', 'Ignis', 'Aeris'],
  8: ['Pyra', 'Bronn', 'Aqua'],
  9: ['Aeris', 'Terra', 'Pyra'],
  10: ['Pyra', 'Aqua', 'Terra', 'Aeris'],
};

const INITIAL_DEFAULT_SQUAD = ['Pyra', 'Aqua', 'Terra', 'Aeris', 'Bronn', 'Ignis'];

export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 100;
  if (level >= 100) return 99999999;
  return Math.floor(100 * Math.pow(level, 1.35));
}

const DEFAULT_MISSIONS: MissionItem[] = [
  {
    id: 'm_daily_1',
    type: 'daily',
    title: 'Kemenangan Harian',
    description: 'Menangkan minimal 1 stage pertempuran.',
    current: 0,
    target: 1,
    rewardGold: 300,
    rewardCrystals: 5,
    rewardXP: 100,
    claimed: false,
  },
  {
    id: 'm_daily_2',
    type: 'daily',
    title: 'Pakar Reaksi Elemen',
    description: 'Picukan 5 reaksi elemen dalam pertempuran.',
    current: 0,
    target: 5,
    rewardGold: 250,
    rewardCrystals: 5,
    rewardXP: 80,
    claimed: false,
  },
  {
    id: 'm_daily_3',
    type: 'daily',
    title: 'Pembersih Monster',
    description: 'Kalahkan 30 musuh penyusup.',
    current: 0,
    target: 30,
    rewardGold: 200,
    rewardCrystals: 5,
    rewardXP: 60,
    claimed: false,
  },
  {
    id: 'm_weekly_1',
    type: 'weekly',
    title: 'Penjelajah Sektor Mingguan',
    description: 'Selesaikan 10 stage pertempuran dalam kampanye.',
    current: 0,
    target: 10,
    rewardGold: 1500,
    rewardCrystals: 25,
    rewardXP: 500,
    claimed: false,
  },
  {
    id: 'm_weekly_2',
    type: 'weekly',
    title: 'Pembasmi Bos Wilayah',
    description: 'Kalahkan 3 bos utama gelombang.',
    current: 0,
    target: 3,
    rewardGold: 2000,
    rewardCrystals: 35,
    rewardXP: 600,
    claimed: false,
  },
  {
    id: 'm_weekly_3',
    type: 'weekly',
    title: 'Harmoni 4 Elemen',
    description: 'Gunakan seluruh 4 elemen (Api, Air, Tanah, Angin) dalam kemenangan.',
    current: 0,
    target: 4,
    rewardGold: 1200,
    rewardCrystals: 20,
    rewardXP: 400,
    claimed: false,
  },
];

const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach_1',
    code: 'FIRST_GUARDIAN',
    title: 'First Guardian',
    description: 'Selesaikan stage pertempuran pertamamu.',
    current: 0,
    target: 1,
    rewardCrystals: 15,
    rewardBadge: 'First Guardian Medal',
    claimed: false,
  },
  {
    id: 'ach_2',
    code: 'ELEMENTAL_MASTER',
    title: 'Elemental Master',
    description: 'Picukan 100 reaksi elemental dalam pertempuran.',
    current: 0,
    target: 100,
    rewardCrystals: 50,
    rewardBadge: 'Master of Synergy',
    claimed: false,
  },
  {
    id: 'ach_3',
    code: 'UNBREAKABLE',
    title: 'Unbreakable Defense',
    description: 'Selesaikan stage dengan Base HP 100% tanpa bocor (Flawless).',
    current: 0,
    target: 1,
    rewardCrystals: 30,
    rewardBadge: 'Aegis Sentinel',
    claimed: false,
  },
  {
    id: 'ach_4',
    code: 'BOSS_HUNTER',
    title: 'Boss Hunter',
    description: 'Kalahkan 10 bos besar dalam kampanye.',
    current: 0,
    target: 10,
    rewardCrystals: 40,
    rewardBadge: 'Titan Slayer',
    claimed: false,
  },
  {
    id: 'ach_5',
    code: 'WILDCARD',
    title: 'Wildcard Strategist',
    description: 'Menangkan pertempuran dengan formasi seimbang 4 elemen.',
    current: 0,
    target: 1,
    rewardCrystals: 25,
    rewardBadge: 'Elemental Harmony',
    claimed: false,
  },
];

const DEFAULT_PROGRESS: PlayerProgress = {
  playerLevel: 1,
  currentXP: 0,
  totalXP: 0,
  gold: 1500, // Starter player gold for initial upgrades
  crystals: 30,
  baseLevel: 1, // Base Level 1: 100 HP, 6 defenders
  heroLevels: ALL_20_HERO_IDS.reduce((acc, id) => {
    acc[id] = 1; // All heroes start at level 1
    return acc;
  }, {} as Record<string, number>),
  singlePlayerSquad: [...INITIAL_DEFAULT_SQUAD],
  multiplayerSquad: ['Pyra', 'Aqua', 'Terra'],
  unlockedLevels: [1],
  levelStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
  levelHighScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
  missions: [...DEFAULT_MISSIONS],
  achievements: [...DEFAULT_ACHIEVEMENTS],
  stats: {
    stagesCompletedCount: 0,
    bossesDefeatedCount: 0,
    totalWins: 0,
    multiplayerWins: 0,
    reactionsTriggered: 0,
    perfectClearCount: 0,
  },
  unlockedBadges: [],
  unlockedHeroes: [...ALL_20_HERO_IDS],
  ownedHeroes: [...STARTER_OWNED_HEROES],
  levelLoadouts: { ...DEFAULT_LEVEL_LOADOUTS },
  settings: {
    volume: 0.8,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    isMuted: false,
    graphicsQuality: 'High',
    screenShake: true,
    language: 'id',
  },
};

const STORAGE_KEY = 'elemental_wildguard_campaign_progress_v3';

export function createFreshMatchState(
  levelId: number = 1,
  playerMode: 'single' | 'coop' = 'single',
  baseLevel: number = 1
): MatchState {
  const validLevel = Math.max(1, Math.min(10, levelId));
  const levelCfg = CAMPAIGN_LEVELS[validLevel] || CAMPAIGN_LEVELS[1];
  const startingBonus = BALANCE_CONFIG.baseStats.startingGoldBonus[baseLevel] || 0;
  const initialGold = (levelCfg.startingGold ?? BALANCE_CONFIG.economy.startingGold) + startingBonus;
  const initialBaseHP = BALANCE_CONFIG.baseStats.baseHP[baseLevel] || 100;

  return {
    levelId: validLevel,
    startingGold: initialGold,
    p1Gold: initialGold,
    p2Gold: initialGold,
    coreHP: initialBaseHP,
    wave: 1,
    currentWaveInLevel: 1,
    totalWaves: levelCfg.totalWaves,
    phase: 'PREPARATION',
    towerLevelsReset: true,
    emptyEnemies: true,
    emptyProjectiles: true,
    defaultCooldowns: true,
    timestamp: Date.now(),
  };
}

class ProgressionManager {
  private progress: PlayerProgress;

  constructor() {
    this.progress = this.loadFromStorage();
  }

  private loadFromStorage(): PlayerProgress {
    if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return this.parseAndValidate(data);
      }
    } catch (err) {
      console.error('Failed to load player progression:', err);
    }
    return { ...DEFAULT_PROGRESS };
  }

  public parseAndValidate(jsonString: string): PlayerProgress {
    try {
      const parsed = JSON.parse(jsonString);
      const playerLevel = Math.max(1, Math.min(100, Number(parsed.playerLevel) || 1));
      const baseLevel = Math.max(1, Math.min(3, Number(parsed.baseLevel) || 1));

      return {
        playerLevel,
        currentXP: Number(parsed.currentXP) || 0,
        totalXP: Number(parsed.totalXP) || 0,
        gold: Math.max(0, Number(parsed.gold) || 0),
        crystals: Math.max(0, Number(parsed.crystals) || 0),
        baseLevel,
        heroLevels:
          parsed.heroLevels && typeof parsed.heroLevels === 'object'
            ? { ...DEFAULT_PROGRESS.heroLevels, ...parsed.heroLevels }
            : { ...DEFAULT_PROGRESS.heroLevels },
        singlePlayerSquad:
          Array.isArray(parsed.singlePlayerSquad) && parsed.singlePlayerSquad.length > 0
            ? this.sanitizeSquad(parsed.singlePlayerSquad, BALANCE_CONFIG.baseStats.defenderCapacity[baseLevel] || 6)
            : [...INITIAL_DEFAULT_SQUAD],
        multiplayerSquad:
          Array.isArray(parsed.multiplayerSquad) && parsed.multiplayerSquad.length > 0
            ? this.sanitizeSquad(parsed.multiplayerSquad, 3)
            : ['Pyra', 'Aqua', 'Terra'],
        unlockedLevels: Array.isArray(parsed.unlockedLevels)
          ? parsed.unlockedLevels.filter((n: any) => typeof n === 'number' && n >= 1 && n <= 10)
          : [1],
        levelStars:
          parsed.levelStars && typeof parsed.levelStars === 'object'
            ? { ...DEFAULT_PROGRESS.levelStars, ...parsed.levelStars }
            : { ...DEFAULT_PROGRESS.levelStars },
        levelHighScores:
          parsed.levelHighScores && typeof parsed.levelHighScores === 'object'
            ? { ...DEFAULT_PROGRESS.levelHighScores, ...parsed.levelHighScores }
            : { ...DEFAULT_PROGRESS.levelHighScores },
        missions: Array.isArray(parsed.missions) && parsed.missions.length > 0
          ? parsed.missions
          : [...DEFAULT_MISSIONS],
        achievements: Array.isArray(parsed.achievements) && parsed.achievements.length > 0
          ? parsed.achievements
          : [...DEFAULT_ACHIEVEMENTS],
        stats: {
          stagesCompletedCount: Number(parsed.stats?.stagesCompletedCount) || 0,
          bossesDefeatedCount: Number(parsed.stats?.bossesDefeatedCount) || 0,
          totalWins: Number(parsed.stats?.totalWins) || 0,
          multiplayerWins: Number(parsed.stats?.multiplayerWins) || 0,
          reactionsTriggered: Number(parsed.stats?.reactionsTriggered) || 0,
          perfectClearCount: Number(parsed.stats?.perfectClearCount) || 0,
        },
        unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
        unlockedHeroes: Array.isArray(parsed.unlockedHeroes)
          ? parsed.unlockedHeroes
          : [...ALL_20_HERO_IDS],
        ownedHeroes: Array.isArray(parsed.ownedHeroes) && parsed.ownedHeroes.length > 0
          ? Array.from(new Set(parsed.ownedHeroes.filter((id: string) => ALL_20_HERO_IDS.includes(id))))
          : [...STARTER_OWNED_HEROES],
        levelLoadouts: this.sanitizeLevelLoadouts(
          parsed.levelLoadouts,
          baseLevel,
          Array.isArray(parsed.ownedHeroes) && parsed.ownedHeroes.length > 0 ? parsed.ownedHeroes : STARTER_OWNED_HEROES
        ),
        settings: {
          volume: Number(parsed.settings?.volume) ?? 0.8,
          musicVolume: Number(parsed.settings?.musicVolume) ?? 0.7,
          sfxVolume: Number(parsed.settings?.sfxVolume) ?? 0.8,
          isMuted: Boolean(parsed.settings?.isMuted),
          graphicsQuality: parsed.settings?.graphicsQuality || 'High',
          screenShake: parsed.settings?.screenShake !== false,
          language: parsed.settings?.language || 'id',
        },
      };
    } catch {
      return { ...DEFAULT_PROGRESS };
    }
  }

  /**
   * Enforces PRD v3.0 Section 13: STRICTLY NO DUPLICATE HEROES in squad.
   */
  public sanitizeSquad(heroIds: string[], capacity: number): string[] {
    const unique = Array.from(new Set(heroIds)).filter((id) => ALL_20_HERO_IDS.includes(id));
    // Fill with missing heroes if unique array is short
    for (const fallbackId of ALL_20_HERO_IDS) {
      if (unique.length >= capacity) break;
      if (!unique.includes(fallbackId)) {
        unique.push(fallbackId);
      }
    }
    return unique.slice(0, capacity);
  }

  /**
   * PRD Addendum Section 13-17: Sanitizes and repairs level-specific loadouts.
   */
  public sanitizeLevelLoadouts(
    raw: any,
    baseLevel: number,
    owned: string[]
  ): Record<number, string[]> {
    const result: Record<number, string[]> = {};
    const cap = BALANCE_CONFIG.baseStats.defenderCapacity[baseLevel] || 6;
    const ownedSet = new Set(owned);

    for (let lvl = 1; lvl <= 10; lvl++) {
      const arr = raw && Array.isArray(raw[lvl]) ? raw[lvl] : DEFAULT_LEVEL_LOADOUTS[lvl];
      const valid = Array.isArray(arr) ? arr.filter((id: string) => ownedSet.has(id)) : [];
      if (valid.length > 0) {
        result[lvl] = Array.from(new Set(valid)).slice(0, cap);
      } else {
        result[lvl] = owned.slice(0, Math.min(3, cap));
      }
    }
    return result;
  }

  public save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (err) {
      console.error('Failed to save player progression:', err);
    }
  }

  public getProgress(): PlayerProgress {
    return { ...this.progress };
  }

  public isLevelUnlocked(levelNum: number): boolean {
    return this.progress.unlockedLevels.includes(levelNum);
  }

  public getStarsForLevel(levelNum: number): number {
    return this.progress.levelStars[levelNum] || 0;
  }

  public getTotalStars(): number {
    return Object.values(this.progress.levelStars).reduce((sum, stars) => sum + stars, 0);
  }

  public getCommanderRank(): { rank: string; icon: string; color: string } {
    const stars = this.getTotalStars();
    const lvl = this.progress.playerLevel;
    if (stars >= 15 || lvl >= 50) {
      return { rank: 'Grand Marshal Supreme', icon: '👑', color: 'text-amber-400' };
    } else if (stars >= 12 || lvl >= 35) {
      return { rank: 'Field Marshal', icon: '⭐', color: 'text-purple-400' };
    } else if (stars >= 9 || lvl >= 25) {
      return { rank: 'General Commander', icon: '⚔️', color: 'text-indigo-400' };
    } else if (stars >= 6 || lvl >= 15) {
      return { rank: 'Captain Vanguard', icon: '🛡️', color: 'text-cyan-400' };
    } else if (stars >= 3 || lvl >= 8) {
      return { rank: 'Lieutenant Guard', icon: '🗡️', color: 'text-emerald-400' };
    } else {
      return { rank: 'Novice Defender', icon: '🌱', color: 'text-slate-400' };
    }
  }

  public getBaseCapacity(): number {
    return BALANCE_CONFIG.baseStats.defenderCapacity[this.progress.baseLevel] || 6;
  }

  public getBaseHP(): number {
    return BALANCE_CONFIG.baseStats.baseHP[this.progress.baseLevel] || 100;
  }

  public getStartingGoldBonus(): number {
    return BALANCE_CONFIG.baseStats.startingGoldBonus[this.progress.baseLevel] || 0;
  }

  /**
   * Adds Player XP with Level 1-100 Progression calculation (PRD v3.0 Section 41-43)
   */
  public addPlayerXP(xpAmount: number): { levelsGained: number; newLevel: number } {
    if (xpAmount <= 0) return { levelsGained: 0, newLevel: this.progress.playerLevel };

    let currentLvl = this.progress.playerLevel;
    let xp = this.progress.currentXP + xpAmount;
    this.progress.totalXP += xpAmount;
    let levelsGained = 0;

    while (currentLvl < 100) {
      const required = calculateXPForLevel(currentLvl);
      if (xp >= required) {
        xp -= required;
        currentLvl++;
        levelsGained++;
      } else {
        break;
      }
    }

    this.progress.playerLevel = currentLvl;
    this.progress.currentXP = xp;
    this.save();
    return { levelsGained, newLevel: currentLvl };
  }

  public addGold(amount: number): void {
    if (amount <= 0) return;
    this.progress.gold += amount;
    this.save();
  }

  public addCrystals(amount: number): void {
    if (amount <= 0) return;
    this.progress.crystals += amount;
    this.save();
  }

  /**
   * Upgrades a Hero's level from 1 to 10 using Player Gold (PRD v3.0 Section 16, 46)
   */
  public upgradeHero(heroId: string): { success: boolean; newLevel: number; cost: number; message: string } {
    const curLevel = this.progress.heroLevels[heroId] || 1;
    if (curLevel >= 10) {
      return { success: false, newLevel: 10, cost: 0, message: 'Hero sudah mencapai level maksimum (Lv.10).' };
    }

    const costIndex = curLevel - 1; // 1->2 is index 0
    const cost = BALANCE_CONFIG.economy.upgradeCosts[costIndex] || 500;

    if (this.progress.gold < cost) {
      return {
        success: false,
        newLevel: curLevel,
        cost,
        message: `Gold tidak mencukupi (Dibutuhkan: ${cost}G, Dimiliki: ${this.progress.gold}G).`,
      };
    }

    this.progress.gold -= cost;
    this.progress.heroLevels[heroId] = curLevel + 1;
    this.save();
    return {
      success: true,
      newLevel: curLevel + 1,
      cost,
      message: `${heroId} berhasil ditingkatkan ke Level ${curLevel + 1}!`,
    };
  }

  /**
   * Upgrades Base Level 1 -> 2 -> 3 (PRD v3.0 Section 36-39)
   */
  public upgradeBase(): { success: boolean; newLevel: number; message: string } {
    const curLevel = this.progress.baseLevel;
    if (curLevel >= 3) {
      return { success: false, newLevel: 3, message: 'Wildguard Base sudah mencapai Level maksimum (Lv.3).' };
    }

    const nextLevel = curLevel + 1;
    const req = BALANCE_CONFIG.baseStats.upgradeRequirements[nextLevel];
    if (!req) {
      return { success: false, newLevel: curLevel, message: 'Persyaratan upgrade tidak ditemukan.' };
    }

    if (this.progress.playerLevel < req.playerLevel) {
      return {
        success: false,
        newLevel: curLevel,
        message: `Level Player belum mencukupi (Dibutuhkan Lv.${req.playerLevel}, saat ini Lv.${this.progress.playerLevel}).`,
      };
    }

    if (this.progress.stats.stagesCompletedCount < req.stageProgress) {
      return {
        success: false,
        newLevel: curLevel,
        message: `Progres Stage belum mencukupi (Dibutuhkan ${req.stageProgress} kemenangan stage, saat ini ${this.progress.stats.stagesCompletedCount}).`,
      };
    }

    if (this.progress.gold < req.goldCost) {
      return {
        success: false,
        newLevel: curLevel,
        message: `Gold tidak mencukupi (Dibutuhkan ${req.goldCost.toLocaleString()}G, saat ini ${this.progress.gold.toLocaleString()}G).`,
      };
    }

    this.progress.gold -= req.goldCost;
    this.progress.baseLevel = nextLevel;

    // Adjust single player squad capacity if needed
    const newCap = BALANCE_CONFIG.baseStats.defenderCapacity[nextLevel];
    this.progress.singlePlayerSquad = this.sanitizeSquad(this.progress.singlePlayerSquad, newCap);

    this.save();
    return {
      success: true,
      newLevel: nextLevel,
      message: `Selamat! Wildguard Base berhasil ditingkatkan ke Level ${nextLevel}! Kapasitas defender: ${newCap} hero, Base HP: ${BALANCE_CONFIG.baseStats.baseHP[nextLevel]}.`,
    };
  }

  /**
   * Sets squad heroes with strict uniqueness and capacity validation
   */
  public setSquad(mode: 'single' | 'coop', heroIds: string[]): boolean {
    const capacity = mode === 'coop' ? 3 : this.getBaseCapacity();
    const sanitized = this.sanitizeSquad(heroIds, capacity);
    if (mode === 'single') {
      this.progress.singlePlayerSquad = sanitized;
    } else {
      this.progress.multiplayerSquad = sanitized;
    }
    this.save();
    return true;
  }

  public updateSquad(heroIds: string[], mode: 'single' | 'coop' = 'single'): boolean {
    return this.setSquad(mode, heroIds);
  }

  /**
   * PRD Addendum Section 13-17: Gets distinct hero loadout strictly for specific level.
   * Level 1 loadout does NOT overwrite or share with Level 2, 3, etc.!
   */
  public getLevelLoadout(levelId: number): string[] {
    const validLevel = Math.max(1, Math.min(10, levelId));
    const cap = this.getBaseCapacity();
    const existing = this.progress.levelLoadouts?.[validLevel];
    if (Array.isArray(existing) && existing.length > 0) {
      const valid = existing.filter((id) => this.progress.ownedHeroes.includes(id));
      if (valid.length > 0) {
        return Array.from(new Set(valid)).slice(0, cap);
      }
    }
    // Fallback if not configured: smart default from owned heroes
    const fallback = this.progress.ownedHeroes.slice(0, Math.min(3, cap));
    if (!this.progress.levelLoadouts) this.progress.levelLoadouts = {};
    this.progress.levelLoadouts[validLevel] = fallback;
    this.save();
    return fallback;
  }

  /**
   * PRD Addendum Section 13-17: Updates hero loadout strictly for specific level.
   */
  public setLevelLoadout(levelId: number, heroIds: string[]): boolean {
    const validLevel = Math.max(1, Math.min(10, levelId));
    const cap = this.getBaseCapacity();
    const unique = Array.from(new Set(heroIds)).filter((id) => this.progress.ownedHeroes.includes(id));
    if (unique.length === 0) return false;
    const sanitized = unique.slice(0, cap);
    if (!this.progress.levelLoadouts) this.progress.levelLoadouts = {};
    this.progress.levelLoadouts[validLevel] = sanitized;
    // Also sync active singlePlayerSquad
    this.progress.singlePlayerSquad = sanitized;
    this.save();
    return true;
  }

  /**
   * PRD Addendum Section 8-11: Owned Heroes Collection
   */
  public getOwnedHeroes(): string[] {
    return [...this.progress.ownedHeroes];
  }

  public isHeroOwned(heroId: string): boolean {
    return this.progress.ownedHeroes.includes(heroId);
  }

  /**
   * PRD Addendum Section 8-10: Hero Shop Purchase Flow
   */
  public buyHero(
    heroId: string,
    currency: 'gold' | 'crystals',
    cost: number
  ): { success: boolean; message: string } {
    if (!ALL_20_HERO_IDS.includes(heroId)) {
      return { success: false, message: 'Hero tidak valid.' };
    }
    if (this.isHeroOwned(heroId)) {
      return { success: false, message: `${heroId} sudah dimiliki!` };
    }

    if (currency === 'gold') {
      if (this.progress.gold < cost) {
        return { success: false, message: `Gold tidak mencukupi (Butuh ${cost}G, punya ${this.progress.gold}G).` };
      }
      this.progress.gold -= cost;
    } else {
      if (this.progress.crystals < cost) {
        return { success: false, message: `Kristal tidak mencukupi (Butuh ${cost} Kristal, punya ${this.progress.crystals}).` };
      }
      this.progress.crystals -= cost;
    }

    this.progress.ownedHeroes.push(heroId);
    if (!this.progress.unlockedHeroes.includes(heroId)) {
      this.progress.unlockedHeroes.push(heroId);
    }
    this.save();
    return { success: true, message: `Selamat! ${heroId} berhasil dibuka dan ditambahkan ke Koleksi Hero!` };
  }

  /**
   * Progresses in-game mission objectives
   */
  public recordMissionProgress(action: 'win_stage' | 'trigger_reaction' | 'defeat_enemy' | 'defeat_boss', amount: number = 1): void {
    if (action === 'trigger_reaction') {
      this.progress.stats.reactionsTriggered += amount;
      // Update reaction achievement
      const ach = this.progress.achievements.find((a) => a.code === 'ELEMENTAL_MASTER');
      if (ach) ach.current = Math.min(ach.target, this.progress.stats.reactionsTriggered);
      // Update daily reaction mission
      const m = this.progress.missions.find((m) => m.id === 'm_daily_2');
      if (m && !m.claimed) m.current = Math.min(m.target, m.current + amount);
    } else if (action === 'defeat_enemy') {
      const m = this.progress.missions.find((m) => m.id === 'm_daily_3');
      if (m && !m.claimed) m.current = Math.min(m.target, m.current + amount);
    } else if (action === 'defeat_boss') {
      this.progress.stats.bossesDefeatedCount += amount;
      const ach = this.progress.achievements.find((a) => a.code === 'BOSS_HUNTER');
      if (ach) ach.current = Math.min(ach.target, this.progress.stats.bossesDefeatedCount);
      const m = this.progress.missions.find((m) => m.id === 'm_weekly_2');
      if (m && !m.claimed) m.current = Math.min(m.target, m.current + amount);
    }
    this.save();
  }

  /**
   * Records stage completion and updates achievements/missions
   */
  public completeLevel(
    levelNum: number,
    starsEarned: number,
    score: number,
    rewardXP: number,
    arg5?: number | string,
    arg6?: number,
    badgeTitle?: string,
    isFlawless: boolean = false
  ): { newlyUnlockedNextLevel: boolean; newStarsAwarded: number } {
    let rewardGold = 0;
    let rewardCrystals = 0;
    let actualBadgeTitle = badgeTitle;

    if (typeof arg5 === 'string') {
      actualBadgeTitle = arg5;
    } else if (typeof arg5 === 'number') {
      rewardGold = arg5;
      if (typeof arg6 === 'number') {
        rewardCrystals = arg6;
      }
    }

    const prevStars = this.progress.levelStars[levelNum] || 0;
    const finalStars = Math.max(prevStars, Math.min(3, Math.max(1, starsEarned)));
    const newStarsAwarded = Math.max(0, finalStars - prevStars);

    this.progress.levelStars[levelNum] = finalStars;
    this.progress.levelHighScores[levelNum] = Math.max(this.progress.levelHighScores[levelNum] || 0, score);

    // Rewards
    this.addPlayerXP(rewardXP);
    if (rewardGold > 0) this.addGold(rewardGold);
    if (rewardCrystals > 0) this.addCrystals(rewardCrystals);

    this.progress.stats.stagesCompletedCount++;
    this.progress.stats.totalWins++;

    if (isFlawless) {
      this.progress.stats.perfectClearCount++;
      const ach = this.progress.achievements.find((a) => a.code === 'UNBREAKABLE');
      if (ach) ach.current = 1;
    }

    // Achievements progress
    const firstGuardAch = this.progress.achievements.find((a) => a.code === 'FIRST_GUARDIAN');
    if (firstGuardAch) firstGuardAch.current = 1;

    // Daily & weekly mission progress
    const mDaily1 = this.progress.missions.find((m) => m.id === 'm_daily_1');
    if (mDaily1 && !mDaily1.claimed) mDaily1.current = Math.min(mDaily1.target, mDaily1.current + 1);

    const mWeekly1 = this.progress.missions.find((m) => m.id === 'm_weekly_1');
    if (mWeekly1 && !mWeekly1.claimed) mWeekly1.current = Math.min(mWeekly1.target, mWeekly1.current + 1);

    if (actualBadgeTitle && !this.progress.unlockedBadges.includes(actualBadgeTitle)) {
      this.progress.unlockedBadges.push(actualBadgeTitle);
    }

    let newlyUnlockedNextLevel = false;
    const nextLevel = levelNum + 1;
    if (nextLevel <= 10 && !this.progress.unlockedLevels.includes(nextLevel)) {
      this.progress.unlockedLevels.push(nextLevel);
      this.progress.unlockedLevels.sort((a, b) => a - b);
      newlyUnlockedNextLevel = true;
    }

    this.save();
    return { newlyUnlockedNextLevel, newStarsAwarded };
  }

  public claimMissionReward(missionId: string): { success: boolean; message: string } {
    const mission = this.progress.missions.find((m) => m.id === missionId);
    if (!mission) return { success: false, message: 'Misi tidak ditemukan.' };
    if (mission.claimed) return { success: false, message: 'Hadiah misi sudah diklaim.' };
    if (mission.current < mission.target) return { success: false, message: 'Target misi belum tercapai.' };

    mission.claimed = true;
    this.addGold(mission.rewardGold);
    this.addCrystals(mission.rewardCrystals);
    this.addPlayerXP(mission.rewardXP);
    this.save();
    return {
      success: true,
      message: `Hadiah misi berhasil diklaim: +${mission.rewardGold}G, +${mission.rewardCrystals} Kristal, +${mission.rewardXP} XP!`,
    };
  }

  public claimAchievementReward(achievementId: string): { success: boolean; message: string } {
    const ach = this.progress.achievements.find((a) => a.id === achievementId);
    if (!ach) return { success: false, message: 'Pencapaian tidak ditemukan.' };
    if (ach.claimed) return { success: false, message: 'Hadiah pencapaian sudah diklaim.' };
    if (ach.current < ach.target) return { success: false, message: 'Pencapaian belum selesai.' };

    ach.claimed = true;
    this.addCrystals(ach.rewardCrystals);
    if (ach.rewardBadge && !this.progress.unlockedBadges.includes(ach.rewardBadge)) {
      this.progress.unlockedBadges.push(ach.rewardBadge);
    }
    this.save();
    return {
      success: true,
      message: `Pencapaian '${ach.title}' diklaim: +${ach.rewardCrystals} Kristal & Badge '${ach.rewardBadge}'!`,
    };
  }

  public updateSettings(newSettings: Partial<PlayerSettings>): void {
    this.progress.settings = { ...this.progress.settings, ...newSettings };
    this.save();
  }

  public unlockAllLevels(): void {
    this.progress.unlockedLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.save();
  }

  public unlockLevel(levelNum: number): void {
    const valid = Math.max(1, Math.min(10, levelNum));
    if (!this.progress.unlockedLevels.includes(valid)) {
      this.progress.unlockedLevels.push(valid);
      this.progress.unlockedLevels.sort((a, b) => a - b);
      this.save();
    }
  }

  public resetAllProgress(): void {
    this.progress = { ...DEFAULT_PROGRESS };
    this.save();
  }
}

export const progression = new ProgressionManager();
