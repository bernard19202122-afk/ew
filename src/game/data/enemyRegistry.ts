/**
 * Elemental Wildguard - Enemy Registry
 * PRD v2.2 compliant base stats, elements, specials, elite mechanics, and bosses.
 */

import { Element, EnemyClass } from '../types/gameTypes';

export interface EnemyTemplate {
  id: string;
  name: string;
  element: Element;
  enemyClass: EnemyClass;
  baseHP: number;
  baseDEF: number;
  baseSpeed: number; // tiles per second
  attackSpeed: number; // attacks per second
  attackDamage: number;
  range: number; // tiles
  attackType: 'Melee' | 'Ranged';
  goldReward: number;
  leakDamage: number;
  description: string;
  eliteMechanicDescription?: string;
}

export const ENEMY_REGISTRY: Record<string, EnemyTemplate> = {
  ForestCrawler: {
    id: 'ForestCrawler',
    name: 'Forest Crawler',
    element: 'Earth',
    enemyClass: 'Normal',
    baseHP: 420,
    baseDEF: 30,
    baseSpeed: 1.0,
    attackSpeed: 1.0,
    attackDamage: 60,
    range: 1.0,
    attackType: 'Melee',
    goldReward: 10,
    leakDamage: 1,
    description: 'Swarming insectoid that advances steadily toward the base.',
    eliteMechanicDescription: 'Hardened: +20% DEF for 4s after taking first damage instance.',
  },

  WildRunner: {
    id: 'WildRunner',
    name: 'Wild Runner',
    element: 'Wind',
    enemyClass: 'Normal',
    baseHP: 320,
    baseDEF: 20,
    baseSpeed: 1.6,
    attackSpeed: 1.4,
    attackDamage: 45,
    range: 1.0,
    attackType: 'Melee',
    goldReward: 10,
    leakDamage: 1,
    description: 'Swift woodland quadruped that dashes past defenses.',
    eliteMechanicDescription: 'Frenzy: +25% movement speed when below 50% HP.',
  },

  RootBeast: {
    id: 'RootBeast',
    name: 'Root Beast',
    element: 'Earth',
    enemyClass: 'Normal',
    baseHP: 1250,
    baseDEF: 60,
    baseSpeed: 0.75,
    attackSpeed: 0.7,
    attackDamage: 110,
    range: 1.0,
    attackType: 'Melee',
    goldReward: 25,
    leakDamage: 1,
    description: 'Tough earthen brute absorbing substantial punishment.',
    eliteMechanicDescription: 'Thick Bark: First damage instance every 5s is reduced by 50%.',
  },

  ShadowBat: {
    id: 'ShadowBat',
    name: 'Shadow Bat',
    element: 'Wind',
    enemyClass: 'Normal',
    baseHP: 360,
    baseDEF: 15,
    baseSpeed: 1.25,
    attackSpeed: 1.5,
    attackDamage: 50,
    range: 4.0,
    attackType: 'Ranged',
    goldReward: 15,
    leakDamage: 1,
    description: 'Flying ranged menace that hurls wind darts from afar.',
    eliteMechanicDescription: 'Evasion: 15% deterministic chance to evade projectile damage.',
  },

  SporeMage: {
    id: 'SporeMage',
    name: 'Spore Mage',
    element: 'Water',
    enemyClass: 'Normal',
    baseHP: 520,
    baseDEF: 25,
    baseSpeed: 0.9,
    attackSpeed: 0.8,
    attackDamage: 90,
    range: 5.0,
    attackType: 'Ranged',
    goldReward: 20,
    leakDamage: 1,
    description: 'Fungal caster. Every 5th attack slows hero Attack Speed by 10% for 3s.',
    eliteMechanicDescription: 'Spore Burst: On death, reduces hero AS by 10% for 3s in 1.5-tile area.',
  },

  ForestHealer: {
    id: 'ForestHealer',
    name: 'Forest Healer',
    element: 'Water',
    enemyClass: 'Normal',
    baseHP: 640,
    baseDEF: 35,
    baseSpeed: 0.8,
    attackSpeed: 0.75,
    attackDamage: 40,
    range: 5.0,
    attackType: 'Ranged',
    goldReward: 25,
    leakDamage: 1,
    description: 'Heals nearby allies for 8% Max HP/sec. Cannot heal Wave 20 or 30 bosses.',
    eliteMechanicDescription: 'Emergency Heal: Once below 50% HP, heals nearby allies for 20% Max HP.',
  },

  RootSummoner: {
    id: 'RootSummoner',
    name: 'Root Summoner',
    element: 'Earth',
    enemyClass: 'Normal',
    baseHP: 780,
    baseDEF: 40,
    baseSpeed: 0.7,
    attackSpeed: 0.7,
    attackDamage: 65,
    range: 4.0,
    attackType: 'Ranged',
    goldReward: 30,
    leakDamage: 1,
    description: 'Every 8s summons 2 Forest Crawlers (max 4 active; gives 0 gold).',
    eliteMechanicDescription: 'Reinforcement: The first time below 50% HP, instantly summons 2 Crawlers.',
  },

  ArmorBeetle: {
    id: 'ArmorBeetle',
    name: 'Armor Beetle',
    element: 'Earth',
    enemyClass: 'Normal',
    baseHP: 1650,
    baseDEF: 90,
    baseSpeed: 0.65,
    attackSpeed: 0.6,
    attackDamage: 95,
    range: 1.0,
    attackType: 'Melee',
    goldReward: 30,
    leakDamage: 1,
    description: 'Heavily armored carapace monster resistant to physical attacks.',
    eliteMechanicDescription: 'Shell Guard: Takes 25% reduced damage while current HP >70%.',
  },

  MistStalker: {
    id: 'MistStalker',
    name: 'Mist Stalker',
    element: 'Wind',
    enemyClass: 'Normal',
    baseHP: 820,
    baseDEF: 30,
    baseSpeed: 1.1,
    attackSpeed: 1.0,
    attackDamage: 120,
    range: 1.0,
    attackType: 'Melee',
    goldReward: 35,
    leakDamage: 1,
    description: 'Stealths every 10s for 3s (+15% speed). Undetectable beyond 2 tiles.',
    eliteMechanicDescription: 'Ambush: First strike out of stealth deals +50% damage.',
  },

  CorruptedDruid: {
    id: 'CorruptedDruid',
    name: 'Corrupted Druid',
    element: 'Fire',
    enemyClass: 'Normal',
    baseHP: 950,
    baseDEF: 45,
    baseSpeed: 0.75,
    attackSpeed: 0.8,
    attackDamage: 120,
    range: 4.0,
    attackType: 'Ranged',
    goldReward: 40,
    leakDamage: 1,
    description: 'Pyromantic shaman whose ranged attacks detonate in a 1.5-tile area of effect.',
    eliteMechanicDescription: 'Nature Pact: Aura grants nearby allies +10% DEF.',
  },

  // ===================== BOSSES =====================
  AncientRootTyrant: {
    id: 'AncientRootTyrant',
    name: 'Ancient Root Tyrant',
    element: 'Earth',
    enemyClass: 'MiniBoss',
    baseHP: 30000,
    baseDEF: 200,
    baseSpeed: 0.55,
    attackSpeed: 0.75,
    attackDamage: 250,
    range: 1.5,
    attackType: 'Melee',
    goldReward: 300,
    leakDamage: 10,
    description: 'Wave 10 Mini-Boss. Phase 2: Root Slam AoE 2 tiles. Phase 3: +25% AS.',
  },

  FlameWarden: {
    id: 'FlameWarden',
    name: 'Flame Warden',
    element: 'Fire',
    enemyClass: 'Boss',
    baseHP: 75000,
    baseDEF: 250,
    baseSpeed: 0.60,
    attackSpeed: 0.65,
    attackDamage: 600,
    range: 1.5,
    attackType: 'Melee',
    goldReward: 600,
    leakDamage: 25,
    description: 'Wave 20 Boss. Phase 2: Inferno Slam AoE 2.5 + Burn. Phase 3: +20% AS.',
  },

  PrimalColossus: {
    id: 'PrimalColossus',
    name: 'Primal Colossus',
    element: 'Earth',
    enemyClass: 'MapBoss',
    baseHP: 100000,
    baseDEF: 300,
    baseSpeed: 0.50,
    attackSpeed: 0.60,
    attackDamage: 1000,
    range: 2.0,
    attackType: 'Melee',
    goldReward: 1200,
    leakDamage: 50,
    description: 'Wave 30 Map Boss. Phase 2: Mountain Pulse Stun 2s. Phase 3: +20% AS. Phase 4: +35% AS.',
  },
};
