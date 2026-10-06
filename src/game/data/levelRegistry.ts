/**
 * Elemental Wildguard - Campaign Level Registry (10 Stages across 5 Regions)
 * Fully compliant with PRD v3.0 Sections 8, 9, 33, 35.
 */

import { Element } from '../types/gameTypes';

export interface LevelStarCriteria {
  star1: string;
  star2: string;
  star3: string;
}

export interface LevelReward {
  gold: number;
  xp: number;
  crystals: number;
  badgeTitle: string;
}

export type StageRegion =
  | 'Verdant Forest'
  | 'Ember Valley'
  | 'Frozen Marsh'
  | 'Stonewild'
  | 'Storm Highlands';

export interface LevelConfig {
  levelNumber: number; // 1 to 10
  code: string; // e.g. "ST-01"
  name: string;
  englishTitle: string;
  region: StageRegion;
  sectorId: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
  sectorName: string;
  totalWaves: number;
  startWaveGlobalIndex: number;
  recommendedElements: Element[];
  recommendedPower: number;
  difficulty: 'Normal' | 'Tactical' | 'Advanced' | 'Hard' | 'Nightmare';
  lore: string;
  bossName: string;
  bossTitle: string;
  startingGold: number;
  starCriteria: LevelStarCriteria;
  reward: LevelReward;
  featuredEnemies: string[];
}

export const CAMPAIGN_LEVELS: Record<number, LevelConfig> = {
  1: {
    levelNumber: 1,
    code: 'ST-01',
    name: 'Pos Terdepan Zamrud (Verdant Outpost)',
    englishTitle: 'Verdant Outpost',
    region: 'Verdant Forest',
    sectorId: 'S1',
    sectorName: 'Verdant Forest Fringe',
    totalWaves: 10,
    startWaveGlobalIndex: 1,
    recommendedElements: ['Earth', 'Fire'],
    recommendedPower: 1200,
    difficulty: 'Normal',
    lore: 'Pengenalan elemental di pinggiran Hutan Zamrud. Pasukan musuh dasar mulai menguji pertahanan Wildguard Base.',
    bossName: 'Forest Vanguard',
    bossTitle: 'Armored Treeback Scout',
    startingGold: 500,
    starCriteria: {
      star1: 'Selesaikan semua 10 Wave pertempuran',
      star2: 'Pertahankan Base HP minimal 70%',
      star3: 'Pertahanan Sempurna: Base HP 100% tanpa bocor',
    },
    reward: {
      gold: 500,
      xp: 150,
      crystals: 5,
      badgeTitle: 'Forest Warden',
    },
    featuredEnemies: ['ForestCrawler', 'WildRunner', 'ShadowBat'],
  },
  2: {
    levelNumber: 2,
    code: 'ST-02',
    name: 'Jantung Rimba Purba (Ancient Grove)',
    englishTitle: 'Ancient Grove Sanctum',
    region: 'Verdant Forest',
    sectorId: 'S1',
    sectorName: 'Ancient Verdant Sanctuary',
    totalWaves: 15,
    startWaveGlobalIndex: 6,
    recommendedElements: ['Fire', 'Wind'],
    recommendedPower: 2200,
    difficulty: 'Normal',
    lore: 'Pohon keramat dilindungi lumut tebal. Pasukan penyembuh musuh mendukung monster cepat menembus barisan pertahanan.',
    bossName: 'Elder Grove Warden',
    bossTitle: 'Guardian of the Hollow Roots',
    startingGold: 600,
    starCriteria: {
      star1: 'Selesaikan semua 15 Wave pertempuran',
      star2: 'Pertahankan Base HP minimal 70%',
      star3: 'Pertahanan Sempurna: Base HP 100%',
    },
    reward: {
      gold: 750,
      xp: 220,
      crystals: 8,
      badgeTitle: 'Grove Champion',
    },
    featuredEnemies: ['ForestCrawler', 'WildRunner', 'ForestHealer', 'ArmorBeetle'],
  },
  3: {
    levelNumber: 3,
    code: 'ST-03',
    name: 'Kaki Bukit Bara (Ember Foothills)',
    englishTitle: 'Ember Foothills',
    region: 'Ember Valley',
    sectorId: 'S2',
    sectorName: 'Scorched Foothills',
    totalWaves: 15,
    startWaveGlobalIndex: 11,
    recommendedElements: ['Water', 'Earth'],
    recommendedPower: 3400,
    difficulty: 'Tactical',
    lore: 'Lembah bersuhu ekstrem tempat magma mengalir bebas. Monster agresif elemen Api membakar segalanya yang dilewati.',
    bossName: 'Magma Hound Alfa',
    bossTitle: 'Scorching Pack Leader',
    startingGold: 700,
    starCriteria: {
      star1: 'Selesaikan semua 15 Wave pertempuran',
      star2: 'Pertahankan Base HP minimal 70%',
      star3: 'Pertahanan Sempurna: Base HP 100%',
    },
    reward: {
      gold: 1000,
      xp: 300,
      crystals: 10,
      badgeTitle: 'Ember Scout',
    },
    featuredEnemies: ['WildRunner', 'CorruptedDruid', 'SporeMage', 'ShadowBat'],
  },
  4: {
    levelNumber: 4,
    code: 'ST-04',
    name: 'Kawah Vulkanik Bara Api (Volcanic Caldera)',
    englishTitle: 'Volcanic Cinder Caldera',
    region: 'Ember Valley',
    sectorId: 'S2',
    sectorName: 'Volcanic Inferno Crag',
    totalWaves: 20,
    startWaveGlobalIndex: 16,
    recommendedElements: ['Water', 'Wind'],
    recommendedPower: 4800,
    difficulty: 'Hard',
    lore: 'Pusat kawah bergolak dipimpin oleh Flame Warden. Lindungi base dari serbuan kawanan elite berzirah api.',
    bossName: 'Flame Warden',
    bossTitle: 'Infernal Commander (75,000 HP)',
    startingGold: 850,
    starCriteria: {
      star1: 'Kalahkan Flame Warden & selesaikan 20 Waves',
      star2: 'Pertahankan Base HP minimal 65%',
      star3: 'Pertahanan Sempurna: Base HP 100%',
    },
    reward: {
      gold: 1400,
      xp: 420,
      crystals: 15,
      badgeTitle: 'Fire Warden Slayer',
    },
    featuredEnemies: ['CorruptedDruid', 'ArmorBeetle', 'FlameWarden', 'ShadowBat'],
  },
  5: {
    levelNumber: 5,
    code: 'ST-05',
    name: 'Rawa Beku Berkabut (Frozen Marsh Delta)',
    englishTitle: 'Frozen Marsh Delta',
    region: 'Frozen Marsh',
    sectorId: 'S3',
    sectorName: 'Misty Glacial Waters',
    totalWaves: 20,
    startWaveGlobalIndex: 18,
    recommendedElements: ['Earth', 'Fire'],
    recommendedPower: 6000,
    difficulty: 'Tactical',
    lore: 'Rawa luas berkabut dingin. Musuh menyelinap tanpa terdeteksi menggunakan kamuflase es dan efek kontrol yang memperlambat hero.',
    bossName: 'Mist Wraith Drake',
    bossTitle: 'Phantom of the Frozen Marsh',
    startingGold: 950,
    starCriteria: {
      star1: 'Selesaikan semua 20 Wave pertempuran',
      star2: 'Pertahankan Base HP minimal 70%',
      star3: 'Pertahanan Sempurna: Base HP 100%',
    },
    reward: {
      gold: 1800,
      xp: 500,
      crystals: 15,
      badgeTitle: 'Marsh Infiltrator',
    },
    featuredEnemies: ['MistStalker', 'SporeMage', 'ForestHealer', 'ArmorBeetle'],
  },
  6: {
    levelNumber: 6,
    code: 'ST-06',
    name: 'Metropolis Kota Tenggelam (Sunken Citadel)',
    englishTitle: 'The Sunken Citadel',
    region: 'Frozen Marsh',
    sectorId: 'S3',
    sectorName: 'Submerged Crystal Ruins',
    totalWaves: 25,
    startWaveGlobalIndex: 20,
    recommendedElements: ['Earth', 'Wind'],
    recommendedPower: 7500,
    difficulty: 'Hard',
    lore: 'Reruntuhan purba hidro-kristal tempat Spore Mage dan Healer saling menguatkan. Butuh reaksi elemen presisi untuk menembus formasi mereka.',
    bossName: 'Glacial Abyssal Drake',
    bossTitle: 'Sire of Frozen Currents',
    startingGold: 1050,
    starCriteria: {
      star1: 'Selesaikan semua 25 Wave pertempuran',
      star2: 'Pertahankan Base HP minimal 65%',
      star3: 'Pertahanan Sempurna: Base HP 100%',
    },
    reward: {
      gold: 2200,
      xp: 600,
      crystals: 20,
      badgeTitle: 'Citadel Reclaimer',
    },
    featuredEnemies: ['SporeMage', 'MistStalker', 'RootSummoner', 'ArmorBeetle'],
  },
  7: {
    levelNumber: 7,
    code: 'ST-07',
    name: 'Ngarai Batu Cadas (Stonewild Gorge)',
    englishTitle: 'Stonewild Gorge',
    region: 'Stonewild',
    sectorId: 'S4',
    sectorName: 'Tectonic Faultline Crags',
    totalWaves: 25,
    startWaveGlobalIndex: 22,
    recommendedElements: ['Wind', 'Fire'],
    recommendedPower: 9200,
    difficulty: 'Hard',
    lore: 'Tebing batu menjulang dengan bebatuan cadas. Musuh lapis baja super tebal dan monster pemanggil ranting membanjiri jalanan.',
    bossName: 'Ancient Root Tyrant',
    bossTitle: 'Tectonic Earth Breaker (30,000 HP)',
    startingGold: 1200,
    starCriteria: {
      star1: 'Kalahkan Ancient Root Tyrant & selesaikan 25 Waves',
      star2: 'Pertahankan Base HP minimal 60%',
      star3: 'Pertahanan Sempurna: Base HP 100%',
    },
    reward: {
      gold: 2800,
      xp: 750,
      crystals: 25,
      badgeTitle: 'Stonebreaker',
    },
    featuredEnemies: ['ArmorBeetle', 'RootSummoner', 'AncientRootTyrant', 'RootBeast'],
  },
  8: {
    levelNumber: 8,
    code: 'ST-08',
    name: 'Benteng Obsidian (Obsidian Bastion)',
    englishTitle: 'Obsidian Bastion',
    region: 'Stonewild',
    sectorId: 'S4',
    sectorName: 'Obsidian Bastion Core',
    totalWaves: 30,
    startWaveGlobalIndex: 24,
    recommendedElements: ['Wind', 'Water', 'Fire'],
    recommendedPower: 11000,
    difficulty: 'Nightmare',
    lore: 'Benteng pertahanan terakhir suku batu kuno. Tekanan tiada henti selama 30 wave dengan gelombang musuh bersenjata berat.',
    bossName: 'Obsidian Behemoth',
    bossTitle: 'Fortress Core Devourer',
    startingGold: 1350,
    starCriteria: {
      star1: 'Bertahan penuh 30 Wave dan kalahkan bos',
      star2: 'Pertahankan Base HP minimal 60%',
      star3: 'Pertahanan Sempurna: Base HP 100%',
    },
    reward: {
      gold: 3500,
      xp: 900,
      crystals: 30,
      badgeTitle: 'Bastion Vanquisher',
    },
    featuredEnemies: ['ArmorBeetle', 'RootSummoner', 'CorruptedDruid', 'MistStalker'],
  },
  9: {
    levelNumber: 9,
    code: 'ST-09',
    name: 'Puncak Dataran Tinggi Badai (Storm Highlands)',
    englishTitle: 'Storm Highlands Ridge',
    region: 'Storm Highlands',
    sectorId: 'S5',
    sectorName: 'Gale Peak Spire',
    totalWaves: 30,
    startWaveGlobalIndex: 25,
    recommendedElements: ['Fire', 'Water', 'Earth'],
    recommendedPower: 13500,
    difficulty: 'Hard',
    lore: 'Puncak tertinggi yang didera angin puyuh abadi. Musuh bergerak dengan kecepatan angin dan serangan jarak jauh beruntun.',
    bossName: 'Cyclone Overlord',
    bossTitle: 'Eye of the Hurricane',
    startingGold: 1500,
    starCriteria: {
      star1: 'Bertahan 30 Wave di ketinggian ekstrem',
      star2: 'Pertahankan Base HP minimal 55%',
      star3: 'Pertahanan Sempurna: Base HP 100%',
    },
    reward: {
      gold: 4200,
      xp: 1100,
      crystals: 40,
      badgeTitle: 'Tempest Conqueror',
    },
    featuredEnemies: ['ShadowBat', 'WildRunner', 'CorruptedDruid', 'MistStalker'],
  },
  10: {
    levelNumber: 10,
    code: 'ST-10',
    name: 'Pusat Kosmik Astral (The Primordial Astral Core)',
    englishTitle: 'The Primordial Astral Core',
    region: 'Storm Highlands',
    sectorId: 'S5',
    sectorName: 'The Primordial Astral Core',
    totalWaves: 30,
    startWaveGlobalIndex: 26,
    recommendedElements: ['Fire', 'Water', 'Earth', 'Wind'],
    recommendedPower: 16000,
    difficulty: 'Nightmare',
    lore: 'Puncak pertempuran klimaks! Seluruh energi kosmik primordial dan 4 elemen bersatu. Kalahkan sang Primal Colossus 3 Phase!',
    bossName: 'Primal Colossus',
    bossTitle: 'Supreme Map Boss (100,000 HP / 300 DEF - 3 Phases)',
    startingGold: 1750,
    starCriteria: {
      star1: 'Kalahkan Primal Colossus Phase 3 & Selesaikan 30 Waves',
      star2: 'Pertahankan Base HP minimal 50%',
      star3: 'Pertahanan Legendaris: Base HP 100% tanpa celah',
    },
    reward: {
      gold: 6000,
      xp: 1500,
      crystals: 60,
      badgeTitle: 'Savior of the Wildguard Realm',
    },
    featuredEnemies: ['RootSummoner', 'CorruptedDruid', 'MistStalker', 'PrimalColossus'],
  },
};
