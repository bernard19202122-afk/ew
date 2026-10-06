/**
 * Elemental Wildguard - Wave Composition Registry
 * PRD v2.2 compliant 30-wave progression with exact enemy groups and intervals.
 */

export interface WaveSpawnItem {
  enemyTemplateId: string;
  isElite?: boolean;
  laneIndex?: number; // 0 or 1 (alternating if undefined)
  delayBeforeNext: number; // In seconds
}

export interface WaveDefinition {
  waveNumber: number;
  preparationTime: number; // 8s, 12s (elite), 15s (mini-boss), 20s (boss)
  description: string;
  spawns: WaveSpawnItem[];
}

export const WAVE_DEFINITIONS: WaveDefinition[] = [
  // W1
  {
    waveNumber: 1,
    preparationTime: 8,
    description: 'First scout forces: Forest Crawlers emerge.',
    spawns: [
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 1.0 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 1.0 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 1.0 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 1.0 },
    ],
  },
  // W2
  {
    waveNumber: 2,
    preparationTime: 8,
    description: 'Crawlers accompanied by swift Wild Runners.',
    spawns: [
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.6 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.6 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 1.0 },
    ],
  },
  // W3
  {
    waveNumber: 3,
    preparationTime: 8,
    description: 'Wind flyers: Shadow Bats join the assault.',
    spawns: [
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.6 },
      { enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 },
      { enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 1.0 },
    ],
  },
  // W4
  {
    waveNumber: 4,
    preparationTime: 8,
    description: 'Spore Mages begin cursing hero attack rhythm.',
    spawns: [
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.6 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 1.0 },
    ],
  },
  // W5
  {
    waveNumber: 5,
    preparationTime: 12,
    description: 'Elite encounter! Elite Forest Crawler with Hardened shell.',
    spawns: [
      { enemyTemplateId: 'ForestCrawler', isElite: true, delayBeforeNext: 2.0 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.6 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.6 },
      { enemyTemplateId: 'ShadowBat', delayBeforeNext: 1.0 },
    ],
  },
  // W6
  {
    waveNumber: 6,
    preparationTime: 8,
    description: 'Armored Root Beasts step onto the battlefield.',
    spawns: [
      { enemyTemplateId: 'RootBeast', delayBeforeNext: 1.2 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 1.0 },
    ],
  },
  // W7
  {
    waveNumber: 7,
    preparationTime: 8,
    description: 'Forest Healers support advancing ranks.',
    spawns: [
      { enemyTemplateId: 'RootBeast', delayBeforeNext: 1.2 },
      { enemyTemplateId: 'ForestHealer', delayBeforeNext: 1.2 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 1.0 },
    ],
  },
  // W8
  {
    waveNumber: 8,
    preparationTime: 8,
    description: 'Double lane pincer attack with varied units.',
    spawns: [
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 },
      { enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 },
      { enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 },
      { enemyTemplateId: 'RootBeast', delayBeforeNext: 1.2 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 1.0 },
    ],
  },
  // W9 - Exactly PRD D1: 6 Crawler, 4 Runner, 2 Shadow Bat, 1 Spore Mage
  {
    waveNumber: 9,
    preparationTime: 8,
    description: 'Prelude to the tyrant: 6 Crawlers, 4 Runners, 2 Bats, 1 Spore Mage.',
    spawns: [
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 },
      { enemyTemplateId: 'ForestCrawler', delayBeforeNext: 1.5 }, // group gap
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 },
      { enemyTemplateId: 'WildRunner', delayBeforeNext: 1.5 },
      { enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 },
      { enemyTemplateId: 'ShadowBat', delayBeforeNext: 1.5 },
      { enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 },
    ],
  },
  // W10 - MINI BOSS
  {
    waveNumber: 10,
    preparationTime: 15,
    description: 'MINI BOSS: Ancient Root Tyrant enters the fray! (30,000 HP, 200 DEF).',
    spawns: [
      { enemyTemplateId: 'AncientRootTyrant', delayBeforeNext: 1.0 },
    ],
  },
  // W11 - PRD: 8 Crawler, 4 Runner, 2 Bat, 1 Spore Mage
  {
    waveNumber: 11,
    preparationTime: 8,
    description: '8 Crawlers, 4 Runners, 2 Bats, 1 Spore Mage.',
    spawns: [
      ...Array(8).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(4).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(2).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      { enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 },
    ],
  },
  // W12 - PRD: 10 Crawler, 5 Runner, 2 Armor Beetle, 1 Forest Healer
  {
    waveNumber: 12,
    preparationTime: 8,
    description: '10 Crawlers, 5 Runners, 2 Armor Beetles, 1 Forest Healer.',
    spawns: [
      ...Array(10).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(5).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(2).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'ForestHealer', delayBeforeNext: 1.2 },
    ],
  },
  // W13 - PRD: 6 Crawler, 5 Runner, 3 Bat, 2 Spore Mage, 1 Root Summoner
  {
    waveNumber: 13,
    preparationTime: 8,
    description: '6 Crawlers, 5 Runners, 3 Bats, 2 Spore Mages, 1 Root Summoner.',
    spawns: [
      ...Array(6).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(5).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(3).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(2).fill({ enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'RootSummoner', delayBeforeNext: 1.2 },
    ],
  },
  // W14 - PRD: 8 Crawler, 6 Runner, 3 Armor Beetle, 2 Forest Healer
  {
    waveNumber: 14,
    preparationTime: 8,
    description: '8 Crawlers, 6 Runners, 3 Beetles, 2 Healers.',
    spawns: [
      ...Array(8).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(6).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(3).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      ...Array(2).fill({ enemyTemplateId: 'ForestHealer', delayBeforeNext: 1.2 }),
    ],
  },
  // W15 - PRD: 1 Elite Root Beast (spawns first), 8 Crawler, 2 Runner
  {
    waveNumber: 15,
    preparationTime: 12,
    description: 'ELITE WAVE: 1 Elite Root Beast leading 8 Crawlers and 2 Runners.',
    spawns: [
      { enemyTemplateId: 'RootBeast', isElite: true, delayBeforeNext: 2.0 },
      ...Array(8).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(2).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
    ],
  },
  // W16 - PRD: 8 Crawler, 6 Runner, 3 Bat, 2 Beetle, 1 Corrupted Druid
  {
    waveNumber: 16,
    preparationTime: 8,
    description: '8 Crawlers, 6 Runners, 3 Bats, 2 Beetles, 1 Corrupted Druid.',
    spawns: [
      ...Array(8).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(6).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(3).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(2).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'CorruptedDruid', delayBeforeNext: 1.0 },
    ],
  },
  // W17 - PRD: 6 Crawler, 8 Runner, 3 Spore Mage, 2 Healer, 1 Mist Stalker
  {
    waveNumber: 17,
    preparationTime: 8,
    description: '6 Crawlers, 8 Runners, 3 Spore Mages, 2 Healers, 1 Mist Stalker.',
    spawns: [
      ...Array(6).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(8).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(3).fill({ enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 }),
      ...Array(2).fill({ enemyTemplateId: 'ForestHealer', delayBeforeNext: 1.2 }),
      { enemyTemplateId: 'MistStalker', delayBeforeNext: 1.0 },
    ],
  },
  // W18 - PRD: 10 Crawler, 6 Runner, 2 Bat, 2 Beetle, 1 Root Summoner, 1 Corrupted Druid
  {
    waveNumber: 18,
    preparationTime: 8,
    description: '10 Crawlers, 6 Runners, 2 Bats, 2 Beetles, 1 Summoner, 1 Druid.',
    spawns: [
      ...Array(10).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(6).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(2).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(2).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'RootSummoner', delayBeforeNext: 1.2 },
      { enemyTemplateId: 'CorruptedDruid', delayBeforeNext: 1.0 },
    ],
  },
  // W19 - PRD: 8 Crawler, 8 Runner, 4 Bat, 3 Beetle, 2 Spore Mage, 1 Mist Stalker
  {
    waveNumber: 19,
    preparationTime: 8,
    description: '8 Crawlers, 8 Runners, 4 Bats, 3 Beetles, 2 Spore Mages, 1 Stalker.',
    spawns: [
      ...Array(8).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(8).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(4).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(3).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      ...Array(2).fill({ enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'MistStalker', delayBeforeNext: 1.0 },
    ],
  },
  // W20 - BOSS: Flame Warden
  {
    waveNumber: 20,
    preparationTime: 20,
    description: 'BOSS BATTLE: Flame Warden strikes! (75,000 HP, 250 DEF).',
    spawns: [
      { enemyTemplateId: 'FlameWarden', delayBeforeNext: 1.0 },
    ],
  },
  // W21 - PRD: 10 Crawler, 8 Runner, 4 Bat, 2 Beetle, 1 Druid
  {
    waveNumber: 21,
    preparationTime: 8,
    description: 'Post-boss escalation: 10 Crawlers, 8 Runners, 4 Bats, 2 Beetles, 1 Druid.',
    spawns: [
      ...Array(10).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(8).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(4).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(2).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'CorruptedDruid', delayBeforeNext: 1.0 },
    ],
  },
  // W22 - PRD: 8 Crawler, 10 Runner, 3 Spore Mage, 2 Healer, 1 Summoner, 1 Stalker
  {
    waveNumber: 22,
    preparationTime: 8,
    description: '8 Crawlers, 10 Runners, 3 Spore Mages, 2 Healers, 1 Summoner, 1 Stalker.',
    spawns: [
      ...Array(8).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(10).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(3).fill({ enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 }),
      ...Array(2).fill({ enemyTemplateId: 'ForestHealer', delayBeforeNext: 1.2 }),
      { enemyTemplateId: 'RootSummoner', delayBeforeNext: 1.2 },
      { enemyTemplateId: 'MistStalker', delayBeforeNext: 1.0 },
    ],
  },
  // W23 - PRD: 12 Crawler, 8 Runner, 4 Bat, 3 Beetle, 2 Druid
  {
    waveNumber: 23,
    preparationTime: 8,
    description: '12 Crawlers, 8 Runners, 4 Bats, 3 Beetles, 2 Druids.',
    spawns: [
      ...Array(12).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(8).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(4).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(3).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      ...Array(2).fill({ enemyTemplateId: 'CorruptedDruid', delayBeforeNext: 1.0 }),
    ],
  },
  // W24 - PRD: 10 Crawler, 10 Runner, 4 Bat, 3 Spore Mage, 2 Healer, 1 Stalker
  {
    waveNumber: 24,
    preparationTime: 8,
    description: '10 Crawlers, 10 Runners, 4 Bats, 3 Spore Mages, 2 Healers, 1 Stalker.',
    spawns: [
      ...Array(10).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(10).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(4).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(3).fill({ enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 }),
      ...Array(2).fill({ enemyTemplateId: 'ForestHealer', delayBeforeNext: 1.2 }),
      { enemyTemplateId: 'MistStalker', delayBeforeNext: 1.0 },
    ],
  },
  // W25 - PRD: 2 Elite Armor Beetle, 8 Crawler, 6 Runner
  {
    waveNumber: 25,
    preparationTime: 12,
    description: 'ELITE WAVE: 2 Elite Armor Beetles leading 8 Crawlers and 6 Runners.',
    spawns: [
      { enemyTemplateId: 'ArmorBeetle', isElite: true, delayBeforeNext: 2.0 },
      { enemyTemplateId: 'ArmorBeetle', isElite: true, delayBeforeNext: 2.0 },
      ...Array(8).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(6).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
    ],
  },
  // W26 - PRD: 12 Crawler, 10 Runner, 4 Bat, 3 Beetle, 2 Spore Mage, 1 Druid
  {
    waveNumber: 26,
    preparationTime: 8,
    description: '12 Crawlers, 10 Runners, 4 Bats, 3 Beetles, 2 Spore Mages, 1 Druid.',
    spawns: [
      ...Array(12).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(10).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(4).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(3).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      ...Array(2).fill({ enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'CorruptedDruid', delayBeforeNext: 1.0 },
    ],
  },
  // W27 - PRD: 10 Crawler, 12 Runner, 5 Bat, 4 Beetle, 3 Spore Mage, 1 Summoner, 1 Stalker
  {
    waveNumber: 27,
    preparationTime: 8,
    description: '10 Crawlers, 12 Runners, 5 Bats, 4 Beetles, 3 Spore Mages, 1 Summoner, 1 Stalker.',
    spawns: [
      ...Array(10).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(12).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(5).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(4).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      ...Array(3).fill({ enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'RootSummoner', delayBeforeNext: 1.2 },
      { enemyTemplateId: 'MistStalker', delayBeforeNext: 1.0 },
    ],
  },
  // W28 - PRD: 14 Crawler, 12 Runner, 5 Bat, 4 Beetle, 3 Healer, 2 Druid, 1 Stalker
  {
    waveNumber: 28,
    preparationTime: 8,
    description: '14 Crawlers, 12 Runners, 5 Bats, 4 Beetles, 3 Healers, 2 Druids, 1 Stalker.',
    spawns: [
      ...Array(14).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(12).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(5).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(4).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      ...Array(3).fill({ enemyTemplateId: 'ForestHealer', delayBeforeNext: 1.2 }),
      ...Array(2).fill({ enemyTemplateId: 'CorruptedDruid', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'MistStalker', delayBeforeNext: 1.0 },
    ],
  },
  // W29 - PRD: 12 Crawler, 14 Runner, 6 Bat, 4 Beetle, 3 Spore Mage, 2 Summoner, 2 Druid, 1 Stalker
  {
    waveNumber: 29,
    preparationTime: 8,
    description: 'Penultimate assault: 12 Crawlers, 14 Runners, 6 Bats, 4 Beetles, 3 Spore Mages, 2 Summoners, 2 Druids, 1 Stalker.',
    spawns: [
      ...Array(12).fill({ enemyTemplateId: 'ForestCrawler', delayBeforeNext: 0.8 }),
      ...Array(14).fill({ enemyTemplateId: 'WildRunner', delayBeforeNext: 0.5 }),
      ...Array(6).fill({ enemyTemplateId: 'ShadowBat', delayBeforeNext: 0.7 }),
      ...Array(4).fill({ enemyTemplateId: 'ArmorBeetle', delayBeforeNext: 1.0 }),
      ...Array(3).fill({ enemyTemplateId: 'SporeMage', delayBeforeNext: 1.0 }),
      ...Array(2).fill({ enemyTemplateId: 'RootSummoner', delayBeforeNext: 1.2 }),
      ...Array(2).fill({ enemyTemplateId: 'CorruptedDruid', delayBeforeNext: 1.0 }),
      { enemyTemplateId: 'MistStalker', delayBeforeNext: 1.0 },
    ],
  },
  // W30 - MAP BOSS: Primal Colossus
  {
    waveNumber: 30,
    preparationTime: 20,
    description: 'FINAL APOCALYPSE: Primal Colossus awakens! (100,000 HP, 300 DEF).',
    spawns: [
      { enemyTemplateId: 'PrimalColossus', delayBeforeNext: 1.0 },
    ],
  },
];
