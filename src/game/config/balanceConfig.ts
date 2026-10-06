/**
 * Elemental Wildguard - BalanceConfig v3.0 Final Production Spec
 * Mandated by PRD v3.0 Sections 4, 5, 20, 23, 35, 36, 37, 38, 39, 41, 73.
 * Principle: Deterministic, data-driven, testable, single source of balance truth.
 */

export interface BalanceConfigType {
  balanceVersion: string;

  // PRD v3.0 Section 73 Core Caps
  coreCaps: {
    playerMaxLevel: number;
    heroMaxLevel: number;
    baseMaxLevel: number;
    maxPlayers: number;
    heroesPerPlayerMultiplayer: number;
  };

  // Base progression (PRD v3.0 Section 36-39)
  baseStats: {
    baseHP: Record<number, number>; // Lv1: 100, Lv2: 125, Lv3: 155
    defenderCapacity: Record<number, number>; // Lv1: 6, Lv2: 7, Lv3: 8
    startingGoldBonus: Record<number, number>; // Lv1: 0, Lv2: 25, Lv3: 50
    upgradeRequirements: Record<
      number,
      {
        playerLevel: number;
        stageProgress: number;
        goldCost: number;
      }
    >;
  };

  heroStats: {
    roleExceptions: {
      tank: {
        hpMaxMultiplier: number;
        defMaxMultiplier: number;
        minAttackSpeed: number;
        minRange: number;
      };
      melee: {
        minRange: number;
      };
      support: {
        maxRange: number;
      };
      ranged: {
        maxRange: number;
      };
    };
    levelMultipliers: {
      values: number[]; // Level 1 to 10
    };
    progression: {
      level5: Record<string, number>;
      level10: Record<string, number>;
    };
  };

  heroSkills: {
    earthMark: {
      sources: string[];
      duration: number;
      maxStacks: number;
      refreshOnReapply: boolean;
    };
    energy: {
      max: number;
      basicAttackGain: number;
      killGain: number;
      eliteHitGain: number;
      eliteKillGain: number;
      bossHitGain: number;
      bossPhaseTransitionGain: number;
      perHeroPerSecondCap: number;
    };
    skillCosts: Record<string, number>;
    pull: {
      maxDisplacement: number;
    };
    zoneDamage: {
      tickInterval: number;
      isDoT: boolean;
      damagePerTickMultiplier: number;
    };
  };

  heroUltimates: {
    defaultInternalCooldown: number;
    cooldownOverrides: Record<string, number>;
    crit: Record<
      'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic',
      { chance: number; damage: number }
    >;
  };

  enemyStats: {
    elements: Record<string, 'Fire' | 'Water' | 'Earth' | 'Wind'>;
    attackStats: Record<
      string,
      { attackSpeed: number; range: number; type: 'Melee' | 'Ranged' }
    >;
    specials: {
      SporeMage: {
        everyNthAttack: number;
        heroAttackSpeedReduction: number;
        duration: number;
      };
      RootSummoner: {
        summonCooldown: number;
        summonsPerCast: number;
        maxSummoned: number;
        summonReward: number;
      };
      ForestHealer: {
        healPercentPerSecond: number;
        tickInterval: number;
        canHealBoss: boolean;
      };
      MistStalker: {
        stealthDuration: number;
        stealthCycle: number;
        detectionRange: number;
        stealthMoveBonus: number;
      };
    };
  };

  // PRD v3.0 Section 35 Wave & Defender scaling
  waveScaling: {
    normalAndElite: {
      hpMultiplierFormula: string; // 1 + ((Wave - 1) * 0.12)
      damageMultiplierFormula: string; // 1 + ((Wave - 1) * 0.08)
      speedMultiplierFormula: string;
      defenderModifierFormula: string; // 1 + ((ActiveDefenders - 6) * 0.08)
    };
    bossExemption: {
      appliesNormalWaveScaling: boolean;
    };
    spawnIntervals: Record<string, number>;
    groupGap: number;
    preparation: number;
    elitePreparation: number;
    miniBossPreparation: number;
    bossPreparation: number;
  };

  economy: {
    startingGold: number;
    waveRewardBase: number;
    waveRewardPerWave: number;
    eliteRewardMultiplier: number;
    sellRefund: number;
    upgradeCosts: number[]; // Hero upgrades Level 1->2 through 9->10
    deploymentCosts: Record<'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic', number>;
  };

  // PRD v3.0 Section 22 & 23 Elemental Reactions
  elementalReactions: {
    flameSurge: {
      elements: ['Fire', 'Wind'];
      name: string;
      bonusBurnDuration: number;
      areaBurnRadius: number;
      damageMultiplier: number;
    };
    mudBind: {
      elements: ['Water', 'Earth'];
      name: string;
      slowPercent: number;
      rootChance: number;
      rootDuration: number;
    };
    steamBurst: {
      elements: ['Fire', 'Water'];
      name: string;
      aoeRadius: number;
      accuracyReduction: number;
      duration: number;
      damageMultiplier: number;
    };
    dustStorm: {
      elements: ['Earth', 'Wind'];
      name: string;
      aoeRadius: number;
      slowPercent: number;
      accuracyReduction: number;
      duration: number;
    };
  };

  synergy: {
    minimumHeroesPerElement: number;
    twoElementRequiresTeamAndTrigger: boolean;
    threeElementRequiresTeamAndTrigger: boolean;
    fourElementRequiresAllFourElements: boolean;
    synergyICD: number;
    recursiveTrigger: boolean;
    recentContributionWindow: number;
    elementTieOrder: Array<'Fire' | 'Water' | 'Earth' | 'Wind'>;
    elementCycle: Record<'Fire' | 'Water' | 'Earth' | 'Wind', 'Fire' | 'Water' | 'Earth' | 'Wind'>;
    advantageMultiplier: number;
    disadvantageMultiplier: number;
    elementalBurst: {
      cooldown: number;
      aoeTiles: number;
      baseMultiplier: number;
      Fire: { burnStacks: number };
      Water: { slow: number; slowDuration: number; allyHeal: number };
      Earth: { earthMark: boolean; stunDuration: number };
      Wind: { pull: number; slow: number; slowDuration: number };
    };
  };

  statusEffects: {
    root: {
      maxNormalDuration: number;
      bossMultiplier: number;
      bossCap: number;
      canAttack: boolean;
      canUseSkills: boolean;
      stopsMovement: boolean;
    };
    burn: {
      maxStacksGlobalPerEnemy: number;
      damagePerSecondPercentSourceATK: number;
      duration: number;
      tickInterval: number;
      replacementRule: string;
    };
    slow: {
      maxPercent: number;
      sameTypeRule: string;
      durationRule: string;
    };
    bossCC: {
      durationMultiplier: number;
      stunCap: number;
      rootCap: number;
      slowCap: number;
      pullCap: number;
    };
    shield: {
      totalCapPercentMaxHP: number;
      sameSourceRule: string;
      differentSourceRule: string;
    };
  };

  terrain: {
    Fire: { damageBonus: number };
    Water: { skillEffectivenessBonus: number };
    Earth: { defenseBonus: number };
    Wind: { rangeBonus: number };
    stacking: string;
  };

  boss: {
    hpEnvelope: [number, number];
    defenseEnvelope: [number, number];
    resistance: number;
    ccResistance: number;
    Wave10MiniBoss: {
      name: string;
      element: 'Earth';
      hp: number;
      defense: number;
      damage: number;
      speed: number;
      attackSpeed: number;
      range: number;
    };
    Wave20Boss: {
      name: string;
      element: 'Fire';
      hp: number;
      defense: number;
      damage: number;
      speed: number;
      attackSpeed: number;
      range: number;
    };
    Wave30MapBoss: {
      name: string;
      element: 'Earth';
      hp: number;
      defense: number;
      damage: number;
      speed: number;
      attackSpeed: number;
      range: number;
    };
  };

  globalCaps: {
    attackSpeedMin: number;
    attackSpeedMax: number;
    critChanceMax: number;
    critDamageMin: number;
    critDamageMax: number;
    movementSpeedMinMultiplier: number;
    movementSpeedMaxMultiplier: number;
    slowMax: number;
    normalStunMax: number;
    bossStunMax: number;
    pullMaxPerEffect: number;
    armorReductionMax: number;
    damageAmplificationMax: number;
    fixedTimestep: number;
    maxEnemiesRecommended: number;
    maxProjectilesRecommended: number;
    maxTemporaryEffectsRecommended: number;
    maxDamageNumbersRecommended: number;
    baseHP: number;
    normalLeakDamage: number;
    eliteLeakDamage: number;
    miniBossLeakDamage: number;
    bossLeakDamage: number;
    mapBossLeakDamage: number;
    minimumDamage: number;
    rounding: string;
  };
}

export const BALANCE_CONFIG: BalanceConfigType = {
  balanceVersion: "3.0.0-production",

  coreCaps: {
    playerMaxLevel: 100,
    heroMaxLevel: 10,
    baseMaxLevel: 3,
    maxPlayers: 2,
    heroesPerPlayerMultiplayer: 3,
  },

  baseStats: {
    baseHP: {
      1: 100,
      2: 125,
      3: 155,
    },
    defenderCapacity: {
      1: 6,
      2: 7,
      3: 8,
    },
    startingGoldBonus: {
      1: 0,
      2: 25,
      3: 50,
    },
    upgradeRequirements: {
      2: {
        playerLevel: 25,
        stageProgress: 20,
        goldCost: 10000,
      },
      3: {
        playerLevel: 50,
        stageProgress: 50,
        goldCost: 25000,
      },
    },
  },

  heroStats: {
    roleExceptions: {
      tank: {
        hpMaxMultiplier: 1.35,
        defMaxMultiplier: 1.30,
        minAttackSpeed: 0.75,
        minRange: 2.0,
      },
      melee: {
        minRange: 2.0,
      },
      support: {
        maxRange: 5.5,
      },
      ranged: {
        maxRange: 6.0,
      },
    },

    levelMultipliers: {
      values: [1.0, 1.10, 1.21, 1.33, 1.46, 1.60, 1.76, 1.93, 2.12, 2.33],
    },

    progression: {
      level5: {
        Pyra_flameDashMultiplier: 2.20,
        Ignis_fireRingMultiplier: 1.90,
        Ignis_scorchChance: 0.30,
        Solara_solarBeamMultiplier: 3.20,
        Solara_heatAura: 0.15,
        Ember_flameArrowMultiplier: 2.10,
        Volkar_moltenCleaveMultiplier: 3.70,
        Aqua_sanctuaryAttackSpeed: 0.25,
        Neria_healingRainPercent: 0.18,
        River_waterPrisonMultiplier: 1.50,
        Mira_refreshHealPercent: 0.15,
        Abyss_depthCollapseMultiplier: 3.00,
        Terra_wallHP: 6000,
        Bronn_groundSlamMultiplier: 2.20,
        Roota_rootTrapMultiplier: 1.30,
        Moss_vineGuardDefense: 0.35,
        Gaia_continentalShield: 0.18,
        Aeris_galeArrowMultiplier: 3.00,
        Zephyr_vacuumPullMultiplier: 1.70,
        Luma_windBlessingAttackSpeed: 0.30,
        Kai_bladeStormHitMultiplier: 0.95,
        Tempest_stormFieldPercentPerSecond: 1.20,
      },
      level10: {
        Pyra_burningBloomExisting: 1,
        Ignis_scorchChance: 0.30,
        Solara_heatAura: 0.15,
        Ember_kindleEveryAttacks: 4,
        Volkar_executionerLowHPBonus: 0.45,
        Aqua_sanctuaryDuration: 10,
        Neria_flowingLifeHeal: 0.08,
        River_flowingEdgeSlow: 0.15,
        Mira_refreshEnergy: 7,
        Abyss_markExplosionMultiplier: 1.50,
        Terra_stoneSkinReduction: 0.25,
        Bronn_ironRootDefense: 0.30,
        Roota_ancientForestSlow: 0.40,
        Moss_reflection: 0.25,
        Gaia_worldCoreReduction: 0.30,
        Aeris_secondaryHitMultiplier: 0.70,
        Zephyr_airCurrentMaxStacks: 4,
        Luma_skyDanceRangeBonus: 0.25,
        Kai_quickstepBonus: 1.20,
        Tempest_stormBurstMultiplier: 3.00,
      },
    },
  },

  heroSkills: {
    earthMark: {
      sources: [
        "Bronn.GroundSlam",
        "Terra.MountainRise",
        "Roota.RootTrap",
        "Gaia.WorldBreaker",
      ],
      duration: 5,
      maxStacks: 1,
      refreshOnReapply: true,
    },

    energy: {
      max: 100,
      basicAttackGain: 3,
      killGain: 5,
      eliteHitGain: 5,
      eliteKillGain: 10,
      bossHitGain: 2,
      bossPhaseTransitionGain: 15,
      perHeroPerSecondCap: 20,
    },

    skillCosts: {
      Pyra: 20,
      Mira: 15,
      Terra: 25,
      Ignis: 20,
      Solara: 25,
      Ember: 15,
      Volkar: 30,
      Aqua: 20,
      Neria: 20,
      River: 20,
      Abyss: 25,
      Bronn: 20,
      Roota: 20,
      Moss: 20,
      Gaia: 30,
      Aeris: 20,
      Zephyr: 20,
      Luma: 15,
      Kai: 20,
      Tempest: 25,
    },

    pull: {
      maxDisplacement: 3,
    },

    zoneDamage: {
      tickInterval: 0.5,
      isDoT: false,
      damagePerTickMultiplier: 0.5,
    },
  },

  heroUltimates: {
    defaultInternalCooldown: 5,
    cooldownOverrides: {
      Pyra: 25,
    },
    crit: {
      Common: {
        chance: 0.05,
        damage: 1.50,
      },
      Rare: {
        chance: 0.08,
        damage: 1.60,
      },
      Epic: {
        chance: 0.12,
        damage: 1.75,
      },
      Legendary: {
        chance: 0.15,
        damage: 2.00,
      },
      Mythic: {
        chance: 0.20,
        damage: 2.25,
      },
    },
  },

  enemyStats: {
    elements: {
      ForestCrawler: "Earth",
      WildRunner: "Wind",
      RootBeast: "Earth",
      ShadowBat: "Wind",
      SporeMage: "Water",
      ForestHealer: "Water",
      RootSummoner: "Earth",
      ArmorBeetle: "Earth",
      MistStalker: "Wind",
      CorruptedDruid: "Fire",
    },

    attackStats: {
      ForestCrawler: { attackSpeed: 1.0, range: 1.0, type: "Melee" },
      WildRunner: { attackSpeed: 1.4, range: 1.0, type: "Melee" },
      RootBeast: { attackSpeed: 0.7, range: 1.0, type: "Melee" },
      ShadowBat: { attackSpeed: 1.5, range: 4.0, type: "Ranged" },
      SporeMage: { attackSpeed: 0.8, range: 5.0, type: "Ranged" },
      ForestHealer: { attackSpeed: 0.75, range: 5.0, type: "Ranged" },
      RootSummoner: { attackSpeed: 0.7, range: 4.0, type: "Ranged" },
      ArmorBeetle: { attackSpeed: 0.6, range: 1.0, type: "Melee" },
      MistStalker: { attackSpeed: 1.0, range: 1.0, type: "Melee" },
      CorruptedDruid: { attackSpeed: 0.8, range: 4.0, type: "Ranged" },
    },

    specials: {
      SporeMage: {
        everyNthAttack: 5,
        heroAttackSpeedReduction: 0.10,
        duration: 3,
      },
      RootSummoner: {
        summonCooldown: 8,
        summonsPerCast: 2,
        maxSummoned: 4,
        summonReward: 0,
      },
      ForestHealer: {
        healPercentPerSecond: 0.08,
        tickInterval: 1,
        canHealBoss: false,
      },
      MistStalker: {
        stealthDuration: 3,
        stealthCycle: 10,
        detectionRange: 2,
        stealthMoveBonus: 0.15,
      },
    },
  },

  waveScaling: {
    normalAndElite: {
      hpMultiplierFormula: "1 + ((Wave - 1) * 0.12)",
      damageMultiplierFormula: "1 + ((Wave - 1) * 0.08)",
      speedMultiplierFormula: "min(1 + Wave * 0.01, 1.30)",
      defenderModifierFormula: "1 + ((ActiveDefenders - 6) * 0.08)",
    },
    bossExemption: {
      appliesNormalWaveScaling: false,
    },
    spawnIntervals: {
      Crawler: 0.80,
      Runner: 0.50,
      Bat: 0.70,
      SporeMage: 1.00,
      Healer: 1.20,
      Summoner: 1.20,
      Beetle: 1.00,
      Stalker: 1.00,
      Druid: 1.00,
      Elite: 2.00,
    },
    groupGap: 1.5,
    preparation: 8,
    elitePreparation: 12,
    miniBossPreparation: 15,
    bossPreparation: 20,
  },

  economy: {
    startingGold: 500,
    waveRewardBase: 100,
    waveRewardPerWave: 20,
    eliteRewardMultiplier: 2.5,
    sellRefund: 0.70,
    // Upgrade costs for levels 1->2 through 9->10 (Total: 5,050 Gold per hero)
    upgradeCosts: [150, 250, 350, 500, 650, 800, 950, 1100, 1300],
    deploymentCosts: {
      Common: 150,
      Rare: 225,
      Epic: 300,
      Legendary: 400,
      Mythic: 500,
    },
  },

  elementalReactions: {
    flameSurge: {
      elements: ['Fire', 'Wind'],
      name: 'Flame Surge',
      bonusBurnDuration: 2.0,
      areaBurnRadius: 2.5,
      damageMultiplier: 2.8,
    },
    mudBind: {
      elements: ['Water', 'Earth'],
      name: 'Mud Bind',
      slowPercent: 0.60,
      rootChance: 0.40,
      rootDuration: 2.0,
    },
    steamBurst: {
      elements: ['Fire', 'Water'],
      name: 'Steam Burst',
      aoeRadius: 2.5,
      accuracyReduction: 0.35,
      duration: 3.5,
      damageMultiplier: 2.5,
    },
    dustStorm: {
      elements: ['Earth', 'Wind'],
      name: 'Dust Storm',
      aoeRadius: 3.0,
      slowPercent: 0.45,
      accuracyReduction: 0.40,
      duration: 4.0,
    },
  },

  synergy: {
    minimumHeroesPerElement: 1,
    twoElementRequiresTeamAndTrigger: true,
    threeElementRequiresTeamAndTrigger: true,
    fourElementRequiresAllFourElements: true,
    synergyICD: 2,
    recursiveTrigger: false,
    recentContributionWindow: 10,
    elementTieOrder: ["Fire", "Water", "Earth", "Wind"],
    elementCycle: {
      Fire: "Earth",
      Earth: "Wind",
      Wind: "Water",
      Water: "Fire",
    },
    advantageMultiplier: 1.15,
    disadvantageMultiplier: 0.85,
    elementalBurst: {
      cooldown: 30,
      aoeTiles: 4,
      baseMultiplier: 4.0,
      Fire: {
        burnStacks: 2,
      },
      Water: {
        slow: 0.50,
        slowDuration: 4,
        allyHeal: 0.15,
      },
      Earth: {
        earthMark: true,
        stunDuration: 1,
      },
      Wind: {
        pull: 2,
        slow: 0.30,
        slowDuration: 3,
      },
    },
  },

  statusEffects: {
    root: {
      maxNormalDuration: 4,
      bossMultiplier: 0.50,
      bossCap: 1.5,
      canAttack: true,
      canUseSkills: true,
      stopsMovement: true,
    },
    burn: {
      maxStacksGlobalPerEnemy: 3,
      damagePerSecondPercentSourceATK: 0.05,
      duration: 4,
      tickInterval: 1,
      replacementRule: "replaceEarliestExpiration",
    },
    slow: {
      maxPercent: 0.80,
      sameTypeRule: "highestMagnitudeWins",
      durationRule: "refresh",
    },
    bossCC: {
      durationMultiplier: 0.50,
      stunCap: 1.5,
      rootCap: 1.5,
      slowCap: 0.80,
      pullCap: 1.5,
    },
    shield: {
      totalCapPercentMaxHP: 1.0,
      sameSourceRule: "refresh",
      differentSourceRule: "additive",
    },
  },

  terrain: {
    Fire: {
      damageBonus: 0.10,
    },
    Water: {
      skillEffectivenessBonus: 0.10,
    },
    Earth: {
      defenseBonus: 0.15,
    },
    Wind: {
      rangeBonus: 0.10,
    },
    stacking: "sameTerrainBonusDoesNotStack",
  },

  boss: {
    hpEnvelope: [75000, 150000],
    defenseEnvelope: [250, 350],
    resistance: 0.10,
    ccResistance: 0.50,

    Wave10MiniBoss: {
      name: "Ancient Root Tyrant",
      element: "Earth",
      hp: 30000,
      defense: 200,
      damage: 250,
      speed: 0.55,
      attackSpeed: 0.75,
      range: 1.5,
    },

    Wave20Boss: {
      name: "Flame Warden",
      element: "Fire",
      hp: 75000,
      defense: 250,
      damage: 600,
      speed: 0.60,
      attackSpeed: 0.65,
      range: 1.5,
    },

    Wave30MapBoss: {
      name: "Primal Colossus",
      element: "Earth",
      hp: 100000,
      defense: 300,
      damage: 1000,
      speed: 0.50,
      attackSpeed: 0.60,
      range: 2.0,
    },
  },

  globalCaps: {
    attackSpeedMin: 0.25,
    attackSpeedMax: 5.0,
    critChanceMax: 1.0,
    critDamageMin: 1.50,
    critDamageMax: 5.0,
    movementSpeedMinMultiplier: 0.5,
    movementSpeedMaxMultiplier: 3.0,
    slowMax: 0.80,
    normalStunMax: 4.0,
    bossStunMax: 1.5,
    pullMaxPerEffect: 3.0,
    armorReductionMax: 0.60,
    damageAmplificationMax: 1.0,
    fixedTimestep: 0.0166666667, // 1/60s
    maxEnemiesRecommended: 100,
    maxProjectilesRecommended: 300,
    maxTemporaryEffectsRecommended: 200,
    maxDamageNumbersRecommended: 100,
    baseHP: 100,
    normalLeakDamage: 1,
    eliteLeakDamage: 3,
    miniBossLeakDamage: 10,
    bossLeakDamage: 25,
    mapBossLeakDamage: 50,
    minimumDamage: 1,
    rounding: "RoundHalfUp",
  },
};
