/**
 * Elemental Wildguard - 20 Heroes Registry
 * PRD v2.2 compliant base stats, skills, progression, and lore.
 */

import { HeroTemplate } from '../types/gameTypes';

export const HERO_REGISTRY: Record<string, HeroTemplate> = {
  // ===================== FIRE HEROES =====================
  Pyra: {
    id: 'Pyra',
    name: 'Pyra',
    element: 'Fire',
    rarity: 'Epic',
    role: 'Ranged',
    baseHP: 1200,
    baseATK: 185,
    baseAS: 1.35, // DPS 249.75
    baseDEF: 45,
    baseRange: 4.5,
    targetPriority: 'FIRST',
    activeSkillName: 'Flame Dash',
    activeSkillCost: 20,
    activeSkillCooldown: 12,
    activeSkillDescription:
      'Blasts the nearest enemy cluster dealing 180% (220% at Lv5) Fire ATK and applying 1 Burn stack.',
    ultimateName: 'Burning Bloom',
    ultimateCooldown: 25, // Hero-specific override (PRD PC-04)
    ultimateDescription:
      'Detonates all active Burns on enemies for 350% ATK damage and blankets target area in wildfire for 6s.',
    lore: 'A fire warden adept at weaving searing blossoms that scorch corrupted invaders.',
  },

  Ignis: {
    id: 'Ignis',
    name: 'Ignis',
    element: 'Fire',
    rarity: 'Rare',
    role: 'Ranged',
    baseHP: 1050,
    baseATK: 130,
    baseAS: 1.15,
    baseDEF: 35,
    baseRange: 4.5,
    targetPriority: 'FIRST',
    activeSkillName: 'Fire Ring',
    activeSkillCost: 20,
    activeSkillCooldown: 10,
    activeSkillDescription:
      'Projects a radiant ring of flames dealing 160% (190% at Lv5) ATK damage and applying 1 Burn stack.',
    ultimateName: 'Inferno Eruption',
    ultimateCooldown: 5,
    ultimateDescription:
      'Summons geysers of molten lava beneath the strongest enemy dealing 400% ATK damage.',
    lore: 'Scholar of the volcanic forge who commands subterranean magma currents.',
  },

  Solara: {
    id: 'Solara',
    name: 'Solara',
    element: 'Fire',
    rarity: 'Legendary',
    role: 'Ranged',
    baseHP: 1400,
    baseATK: 145,
    baseAS: 1.10,
    baseDEF: 50,
    baseRange: 5.0,
    targetPriority: 'STRONGEST',
    activeSkillName: 'Solar Beam',
    activeSkillCost: 25,
    activeSkillCooldown: 14,
    activeSkillDescription:
      'Channels intense solar light in a line dealing 280% (320% at Lv5) ATK and illuminating targets.',
    ultimateName: 'Sunburst Wrath',
    ultimateCooldown: 5,
    ultimateDescription:
      'Calls down an orbital solar flare dealing 550% ATK to all enemies in a 3-tile radius.',
    lore: 'High priestess of the solar crown capable of focusing daylight into devastating beams.',
  },

  Ember: {
    id: 'Ember',
    name: 'Ember',
    element: 'Fire',
    rarity: 'Common',
    role: 'Ranged',
    baseHP: 900,
    baseATK: 95,
    baseAS: 1.35, // DPS 128.25
    baseDEF: 30,
    baseRange: 4.0,
    targetPriority: 'FIRST',
    activeSkillName: 'Flame Arrow',
    activeSkillCost: 15,
    activeSkillCooldown: 8,
    activeSkillDescription:
      'Fires an incendiary arrow dealing 180% (210% at Lv5) ATK damage. Every 5th (4th at Lv10) attack applies Burn.',
    ultimateName: 'Meteor Spark',
    ultimateCooldown: 5,
    ultimateDescription:
      'Rains fiery sparks over a 2-tile radius dealing 300% ATK damage.',
    lore: 'Nimble archer from the ember peaks, quick with her flaming bow.',
  },

  Volkar: {
    id: 'Volkar',
    name: 'Volkar',
    element: 'Fire',
    rarity: 'Mythic',
    role: 'Melee',
    baseHP: 2100,
    baseATK: 225,
    baseAS: 1.05,
    baseDEF: 85,
    baseRange: 2.0,
    targetPriority: 'STRONGEST',
    activeSkillName: 'Molten Cleave',
    activeSkillCost: 30,
    activeSkillCooldown: 15,
    activeSkillDescription:
      'Swings a giant molten greatsword dealing 320% (370% at Lv5) ATK in a cone.',
    ultimateName: 'Volcanic Judgment',
    ultimateCooldown: 5,
    ultimateDescription:
      'Unleashes catastrophic titan magma dealing 800% ATK damage to the target enemy (+45% bonus vs enemies <30% HP at Lv10).',
    lore: 'Ancient colossus warlord forged inside the molten belly of Mount Cinder.',
  },

  // ===================== WATER HEROES =====================
  Aqua: {
    id: 'Aqua',
    name: 'Aqua',
    element: 'Water',
    rarity: 'Legendary',
    role: 'Support',
    baseHP: 1350,
    baseATK: 165,
    baseAS: 1.25,
    baseDEF: 55,
    baseRange: 5.0,
    targetPriority: 'LOWEST_HP_ALLY',
    activeSkillName: 'Sanctuary',
    activeSkillCost: 20,
    activeSkillCooldown: 15,
    activeSkillDescription:
      'Creates a soothing tide granting adjacent allies +20% (+25% at Lv5) Attack Speed for 8s (10s at Lv10).',
    ultimateName: 'Tidal Wave',
    ultimateCooldown: 5,
    ultimateDescription:
      'Summons a massive surging wave knocking back non-boss enemies and slowing them by 40% for 4s.',
    lore: 'Oceanic siren whose song harmonizes elemental waves and rejuvenates allies.',
  },

  Neria: {
    id: 'Neria',
    name: 'Neria',
    element: 'Water',
    rarity: 'Rare',
    role: 'Support',
    baseHP: 1150,
    baseATK: 110,
    baseAS: 1.10,
    baseDEF: 40,
    baseRange: 4.5,
    targetPriority: 'LOWEST_HP_ALLY',
    activeSkillName: 'Healing Rain',
    activeSkillCost: 20,
    activeSkillCooldown: 12,
    activeSkillDescription:
      'Summons gentle mist that heals all allies for 15% (18% at Lv5) Max HP over 3 seconds.',
    ultimateName: 'Purifying Cascade',
    ultimateCooldown: 5,
    ultimateDescription:
      'Cleanses debuffs on all allies and grants a refreshing shield absorbing 200 damage.',
    lore: 'Gentle river spirit whose waters wash away blighted corruption.',
  },

  River: {
    id: 'River',
    name: 'River',
    element: 'Water',
    rarity: 'Epic',
    role: 'Melee',
    baseHP: 1500,
    baseATK: 120,
    baseAS: 1.35, // DPS 162.00
    baseDEF: 60,
    baseRange: 2.0,
    targetPriority: 'FIRST',
    activeSkillName: 'Water Prison',
    activeSkillCost: 20,
    activeSkillCooldown: 11,
    activeSkillDescription:
      'Traps the lead enemy in swirling water dealing 120% (150% at Lv5) ATK and applying 40% Slow for 3s.',
    ultimateName: 'Torrential Slash',
    ultimateCooldown: 5,
    ultimateDescription:
      'Executes a high-velocity whirlpool slash dealing 380% ATK damage to all nearby foes.',
    lore: 'Swift bladesman who flows around opponent defenses like a mountain stream.',
  },

  Mira: {
    id: 'Mira',
    name: 'Mira',
    element: 'Water',
    rarity: 'Common',
    role: 'Support',
    baseHP: 950,
    baseATK: 90,
    baseAS: 1.20,
    baseDEF: 35,
    baseRange: 4.5,
    targetPriority: 'LOWEST_HP_ALLY',
    activeSkillName: 'Refresh',
    activeSkillCost: 15,
    activeSkillCooldown: 9,
    activeSkillDescription:
      'Restores 12% (15% at Lv5) Max HP and 5 (7 at Lv10) Energy to the lowest HP ally.',
    ultimateName: 'Spring of Renewal',
    ultimateCooldown: 5,
    ultimateDescription:
      'Fills all active heroes with +10% Attack Speed and heals 10% Max HP instantly.',
    lore: 'Village herbalist carrying sacred water flasks from the hidden grove.',
  },

  Abyss: {
    id: 'Abyss',
    name: 'Abyss',
    element: 'Water',
    rarity: 'Mythic',
    role: 'Ranged',
    baseHP: 1800,
    baseATK: 210,
    baseAS: 1.10,
    baseDEF: 70,
    baseRange: 5.0,
    targetPriority: 'STRONGEST',
    activeSkillName: 'Depth Collapse',
    activeSkillCost: 25,
    activeSkillCooldown: 16,
    activeSkillDescription:
      'Crushes the target with abyssal pressure dealing 250% (300% at Lv5) ATK and applying Abyssal Mark.',
    ultimateName: 'Maelstrom of the Deep',
    ultimateCooldown: 5,
    ultimateDescription:
      'Summons a dark vortex pulling enemies toward center while dealing 500% ATK damage.',
    lore: 'Ancient sovereign of the oceanic trench who commands unyielding hydropressure.',
  },

  // ===================== EARTH HEROES =====================
  Terra: {
    id: 'Terra',
    name: 'Terra',
    element: 'Earth',
    rarity: 'Legendary',
    role: 'Tank',
    baseHP: 1850,
    baseATK: 140,
    baseAS: 0.90,
    baseDEF: 120, // Role exception: Tank DEF
    baseRange: 2.0,
    targetPriority: 'FIRST',
    activeSkillName: 'Mountain Rise / Earth Wall',
    activeSkillCost: 25,
    activeSkillCooldown: 18,
    activeSkillDescription:
      'Erects an Earth Wall with 5,000 HP (6,000 at Lv5) on an adjacent path tile if reachability check passes, blocking movement until destroyed.',
    ultimateName: 'Tectonic Fortress',
    ultimateCooldown: 5,
    ultimateDescription:
      'Fortifies all allies with 20% (25% at Lv10) Stone Skin damage reduction and grants a 400 HP shield for 6s.',
    lore: 'Immovable guardian sentinel carved from living mountain basalt.',
  },

  Bronn: {
    id: 'Bronn',
    name: 'Bronn',
    element: 'Earth',
    rarity: 'Epic',
    role: 'Tank',
    baseHP: 1700,
    baseATK: 125,
    baseAS: 0.85,
    baseDEF: 100,
    baseRange: 2.0,
    targetPriority: 'FIRST',
    activeSkillName: 'Ground Slam',
    activeSkillCost: 20,
    activeSkillCooldown: 12,
    activeSkillDescription:
      'Slams warhammer into ground dealing 180% (220% at Lv5) ATK, inflicting Root for 1.5s, and applying Earth Mark (5s).',
    ultimateName: 'Cataclysmic Quake',
    ultimateCooldown: 5,
    ultimateDescription:
      'Shakes the bedrock dealing 360% ATK to all grounded enemies in a 3-tile line.',
    lore: 'Veteran dwarf miner turned frontline bastion against corrupted earth beasts.',
  },

  Roota: {
    id: 'Roota',
    name: 'Roota',
    element: 'Earth',
    rarity: 'Rare',
    role: 'Support',
    baseHP: 1200,
    baseATK: 105,
    baseAS: 1.05,
    baseDEF: 45,
    baseRange: 4.5,
    targetPriority: 'FIRST',
    activeSkillName: 'Root Trap',
    activeSkillCost: 20,
    activeSkillCooldown: 10,
    activeSkillDescription:
      'Entangles enemies in creeping briars dealing 100% (130% at Lv5) ATK, inflicting Root for 3s (boss 1.5s), and applying Earth Mark.',
    ultimateName: 'Ancient Forest Canopy',
    ultimateCooldown: 5,
    ultimateDescription:
      'Envelopes the battlefield in overgrown vines slowing all enemies by 35% (40% at Lv10) for 5s.',
    lore: 'Forest dryad communicating through root mycelium across the elemental forest.',
  },

  Moss: {
    id: 'Moss',
    name: 'Moss',
    element: 'Earth',
    rarity: 'Common',
    role: 'Tank',
    baseHP: 1450,
    baseATK: 85,
    baseAS: 0.80,
    baseDEF: 80,
    baseRange: 2.0,
    targetPriority: 'FIRST',
    activeSkillName: 'Vine Guard',
    activeSkillCost: 20,
    activeSkillCooldown: 10,
    activeSkillDescription:
      'Hardens bark armor granting +30% (+35% at Lv5) DEF and reflecting 20% (25% at Lv10) damage taken for 6s.',
    ultimateName: 'Living Bramble',
    ultimateCooldown: 5,
    ultimateDescription:
      'Creates a thorny barrier granting all front-line allies 250 shield.',
    lore: 'Gentle animated moss golem protecting wild woodland critters.',
  },

  Gaia: {
    id: 'Gaia',
    name: 'Gaia',
    element: 'Earth',
    rarity: 'Mythic',
    role: 'Tank',
    baseHP: 2300,
    baseATK: 170,
    baseAS: 0.85,
    baseDEF: 135,
    baseRange: 2.0,
    targetPriority: 'STRONGEST',
    activeSkillName: 'World Breaker',
    activeSkillCost: 30,
    activeSkillCooldown: 16,
    activeSkillDescription:
      'Crushes the tectonic plates dealing 280% ATK, stunning enemies for 1s, and applying Earth Mark (5s).',
    ultimateName: 'Continental Shield',
    ultimateCooldown: 5,
    ultimateDescription:
      'Shields all allies for 15% (18% at Lv5) of their Max HP for 6s. Passive World Core provides 25% (30% at Lv10) damage reduction.',
    lore: 'The primordial embodiment of the earth mantle, enduring across aeons.',
  },

  // ===================== WIND HEROES =====================
  Aeris: {
    id: 'Aeris',
    name: 'Aeris',
    element: 'Wind',
    rarity: 'Legendary',
    role: 'Ranged',
    baseHP: 1300,
    baseATK: 180,
    baseAS: 1.40, // DPS 252.00
    baseDEF: 45,
    baseRange: 5.5,
    targetPriority: 'FIRST',
    activeSkillName: 'Gale Arrow',
    activeSkillCost: 20,
    activeSkillCooldown: 11,
    activeSkillDescription:
      'Fires a piercing gale arrow dealing 250% (300% at Lv5) ATK in a line. Pulls targets 0.5 tile/s for 6s (capped at 3 tiles cumulative).',
    ultimateName: 'Eye of the Storm',
    ultimateCooldown: 5,
    ultimateDescription:
      'Forms a razor cyclone dealing 120% ATK/sec (60% per 0.5s tick) and applying 30% Slow in a 2-tile radius for 5s.',
    lore: 'Skyward ranger who commands stratospheric crosswinds and eagle precision.',
  },

  Zephyr: {
    id: 'Zephyr',
    name: 'Zephyr',
    element: 'Wind',
    rarity: 'Epic',
    role: 'Ranged',
    baseHP: 1250,
    baseATK: 150,
    baseAS: 1.30, // DPS 195.00
    baseDEF: 45,
    baseRange: 4.5,
    targetPriority: 'FIRST',
    activeSkillName: 'Vacuum Pull',
    activeSkillCost: 20,
    activeSkillCooldown: 10,
    activeSkillDescription:
      'Creates a low pressure pocket dealing 140% (170% at Lv5) ATK and pulling enemies 1.5 tiles toward center.',
    ultimateName: 'Tornado Prison',
    ultimateCooldown: 5,
    ultimateDescription:
      'Summons a twister trapping enemies for 90% ATK/sec (45% per 0.5s tick) for 4s.',
    lore: 'Whirlwind trickster who manipulates air turbulence to disrupt advancing legions.',
  },

  Luma: {
    id: 'Luma',
    name: 'Luma',
    element: 'Wind',
    rarity: 'Rare',
    role: 'Support',
    baseHP: 1100,
    baseATK: 100,
    baseAS: 1.25,
    baseDEF: 35,
    baseRange: 5.0,
    targetPriority: 'FIRST',
    activeSkillName: 'Wind Blessing',
    activeSkillCost: 15,
    activeSkillCooldown: 9,
    activeSkillDescription:
      'Blesses allies with tailwinds granting +25% (+30% at Lv5) Attack Speed for 6s.',
    ultimateName: 'Sky Dance',
    ultimateCooldown: 5,
    ultimateDescription:
      'Grants all allies +15% AS and +20% (+25% at Lv10) Attack Range for 8s.',
    lore: 'Zephyr dancer whose fan movements generate invigorating thermal currents.',
  },

  Kai: {
    id: 'Kai',
    name: 'Kai',
    element: 'Wind',
    rarity: 'Common',
    role: 'Melee',
    baseHP: 1200,
    baseATK: 105,
    baseAS: 1.60, // DPS 168.00
    baseDEF: 40,
    baseRange: 2.0,
    targetPriority: 'FIRST',
    activeSkillName: 'Blade Storm',
    activeSkillCost: 20,
    activeSkillCooldown: 9,
    activeSkillDescription:
      'Strikes rapidly 3 times dealing 80% (95% at Lv5) ATK per strike.',
    ultimateName: 'Cyclone Dash',
    ultimateCooldown: 5,
    ultimateDescription:
      'Dashes through the front ranks dealing 280% ATK and boosting next 3 attacks by 100% (120% at Lv10).',
    lore: 'Agile nomad swordsman whose twin daggers slice like mountain squalls.',
  },

  Tempest: {
    id: 'Tempest',
    name: 'Tempest',
    element: 'Wind',
    rarity: 'Mythic',
    role: 'Ranged',
    baseHP: 1600,
    baseATK: 195,
    baseAS: 1.25,
    baseDEF: 60,
    baseRange: 5.5,
    targetPriority: 'FIRST',
    activeSkillName: 'Storm Field',
    activeSkillCost: 25,
    activeSkillCooldown: 14,
    activeSkillDescription:
      'Summons a swirling thunderstorm dealing 100%/sec (50% per 0.5s tick, 120%/sec at Lv5) and pulling enemies 0.75 tile/s (capped at 3.0 tiles max displacement).',
    ultimateName: 'Storm Burst',
    ultimateCooldown: 5,
    ultimateDescription:
      'Discharges an apocalyptic lightning thunderclap dealing 250% (300% at Lv10) ATK to all enemies on screen.',
    lore: 'Incarnation of high-altitude typhoons capable of leveling mountain forests in seconds.',
  },
};
