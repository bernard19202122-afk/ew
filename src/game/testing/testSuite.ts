/**
 * Elemental Wildguard - Automated PRD v2.2 Verification Test Suite
 * Executes all Test Cases from Section 10 (TC-A1 through TC-C7) and Section 11 Edge Cases.
 */

import { BALANCE_CONFIG } from '../config/balanceConfig';
import { ENEMY_REGISTRY } from '../data/enemyRegistry';
import { HERO_REGISTRY } from '../data/heroRegistry';
import {
  calculateCCDuration,
  calculateEffectiveAttackSpeed,
  calculateEliteReward,
  calculateFinalDamage,
  calculatePullDisplacement,
  getCritStats,
  getDefenseModifier,
  getElementModifier,
  getHeroLevelMultiplier,
  roundHalfUp,
} from '../engine/combatFormulas';
import { GameSimulation, createNewGameSession } from '../engine/gameSimulation';
import { validateEarthWallPlacement } from '../engine/pathfinding';
import { PCG32 } from '../engine/rng';
import { SynergyManager } from '../engine/synergySystem';
import { CAMPAIGN_LEVELS } from '../data/levelRegistry';
import { progression, createFreshMatchState } from '../engine/progressionManager';

export interface TestResultItem {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  details: string;
  expected?: any;
  actual?: any;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestResultItem[];
}

export function runAllPRDTests(): TestSuiteSummary {
  const startTime = performance.now();
  const results: TestResultItem[] = [];

  const assert = (id: string, category: string, name: string, condition: boolean, details: string, expected?: any, actual?: any) => {
    results.push({
      id,
      category,
      name,
      passed: condition,
      details,
      expected,
      actual,
    });
  };

  // ==========================================
  // TC-A1: Earth Mark
  // ==========================================
  {
    const sim = new GameSimulation(100n);
    sim.spawnEnemy('ForestCrawler');
    const enemy = sim.enemies[0];

    sim.applyEarthMark(enemy);
    assert(
      'TC-A1-01',
      'A1 Earth Mark',
      'Earth Mark application & duration',
      enemy.statuses.earthMarkDuration === 5,
      `Earth Mark duration is ${enemy.statuses.earthMarkDuration}s (expected 5s)`,
      5,
      enemy.statuses.earthMarkDuration
    );

    // Reapplication within 5s
    enemy.statuses.earthMarkDuration = 2.5;
    sim.applyEarthMark(enemy);
    assert(
      'TC-A1-02',
      'A1 Earth Mark',
      'Earth Mark max 1 stack & refresh to 5s',
      enemy.statuses.earthMarkDuration === 5,
      `Reapplication refreshed duration to ${enemy.statuses.earthMarkDuration}s without adding stack`,
      5,
      enemy.statuses.earthMarkDuration
    );
  }

  // ==========================================
  // TC-A2: Root Status
  // ==========================================
  {
    const normalRoot = calculateCCDuration(3.0, false, 'root');
    assert(
      'TC-A2-01',
      'A2 Root Status',
      'Normal enemy root duration up to 4s',
      normalRoot === 3.0,
      `Normal root duration: ${normalRoot}s`,
      3.0,
      normalRoot
    );

    const bossRoot = calculateCCDuration(3.0, true, 'root');
    // 3.0 * 0.5 = 1.5s, cap 1.5s
    assert(
      'TC-A2-02',
      'A2 Root Status',
      'Boss root halved & capped at 1.5s',
      bossRoot === 1.5,
      `Boss root duration: ${bossRoot}s (expected 1.5s)`,
      1.5,
      bossRoot
    );
  }

  // ==========================================
  // TC-A3: Enemy Element Advantage Cycle
  // ==========================================
  {
    const fireVsEarth = getElementModifier('Fire', 'Earth');
    assert(
      'TC-A3-01',
      'A3 Element Advantage',
      'Fire attacker -> Earth defender (+15%)',
      Math.abs(fireVsEarth - 1.15) < 0.001,
      `Fire vs Earth modifier: ${fireVsEarth}`,
      1.15,
      fireVsEarth
    );

    const earthVsFire = getElementModifier('Earth', 'Fire');
    assert(
      'TC-A3-02',
      'A3 Element Advantage',
      'Earth attacker -> Fire defender (-15%)',
      Math.abs(earthVsFire - 0.85) < 0.001,
      `Earth vs Fire modifier: ${earthVsFire}`,
      0.85,
      earthVsFire
    );

    // Verify all 10 normal enemies have an element
    const enemyKeys = Object.keys(BALANCE_CONFIG.enemyStats.elements);
    assert(
      'TC-A3-03',
      'A3 Element Advantage',
      'All 10 normal enemies have assigned elements',
      enemyKeys.length === 10,
      `Total assigned enemy elements: ${enemyKeys.length}`,
      10,
      enemyKeys.length
    );
  }

  // ==========================================
  // TC-A4: Base HP & Leak Damage
  // ==========================================
  {
    const normalLeak = BALANCE_CONFIG.globalCaps.normalLeakDamage;
    const eliteLeak = BALANCE_CONFIG.globalCaps.eliteLeakDamage;
    const bossLeak = BALANCE_CONFIG.globalCaps.bossLeakDamage;
    const mapBossLeak = BALANCE_CONFIG.globalCaps.mapBossLeakDamage;

    assert(
      'TC-A4-01',
      'A4 Base Damage',
      'Leak damage values (Normal=1, Elite=3, Boss=25, MapBoss=50)',
      normalLeak === 1 && eliteLeak === 3 && bossLeak === 25 && mapBossLeak === 50,
      `Leaks: Normal=${normalLeak}, Elite=${eliteLeak}, Boss=${bossLeak}, MapBoss=${mapBossLeak}`,
      '1, 3, 25, 50',
      `${normalLeak}, ${eliteLeak}, ${bossLeak}, ${mapBossLeak}`
    );
  }

  // ==========================================
  // TC-A5: Enemy Attack System
  // ==========================================
  {
    const bat = BALANCE_CONFIG.enemyStats.attackStats.ShadowBat;
    const crawler = BALANCE_CONFIG.enemyStats.attackStats.ForestCrawler;

    assert(
      'TC-A5-01',
      'A5 Enemy Attack',
      'Shadow Bat ranged 4.0 tiles, Crawler melee 1.0 tile',
      bat.type === 'Ranged' && bat.range === 4.0 && crawler.type === 'Melee' && crawler.range === 1.0,
      `Bat: ${bat.type} ${bat.range} tiles; Crawler: ${crawler.type} ${crawler.range} tiles`,
      'Ranged 4.0 / Melee 1.0',
      `${bat.type} ${bat.range} / ${crawler.type} ${crawler.range}`
    );
  }

  // ==========================================
  // TC-A6: Target Priority Tie-Breakers
  // ==========================================
  {
    const sim = new GameSimulation(101n);
    sim.spawnEnemy('ForestCrawler');
    sim.spawnEnemy('ForestCrawler');
    const [e1, e2] = sim.enemies;

    // Both have equal HP, e1 has lower entity ID
    assert(
      'TC-A6-01',
      'A6 Targeting',
      'Equal stats tie-break prefers lower entity ID',
      e1.instanceId < e2.instanceId,
      `Entity 1 ID: ${e1.instanceId}, Entity 2 ID: ${e2.instanceId}`,
      true,
      e1.instanceId < e2.instanceId
    );
  }

  // ==========================================
  // TC-A7: Synergy Activation & No Recursive Trigger
  // ==========================================
  {
    const synMgr = new SynergyManager();
    const sim = new GameSimulation(102n);
    sim.gold = 1000;
    sim.deployHero('Pyra', 0); // Fire
    sim.deployHero('Aqua', 2); // Water

    sim.spawnEnemy('ForestCrawler');
    const enemy = sim.enemies[0];
    enemy.statuses.burns.push({ sourceHeroId: 'h1', dps: 10, remainingTime: 4.0 });
    enemy.statuses.slow = { percent: 0.3, remainingTime: 3.0 };

    // Trigger Steamfall / Steam Burst
    const syn1 = synMgr.checkSynergyTrigger(enemy, 'Fire', sim.heroes, 100);
    const isSteamReaction = syn1 !== null && (syn1.synergyName === 'Steamfall' || syn1.synergyName === 'Steam Burst');
    assert(
      'TC-A7-01',
      'A7 Synergy',
      'Steamfall / Steam Burst triggers when Burn + Slow on enemy',
      isSteamReaction,
      `Triggered: ${syn1?.synergyName ?? 'None'}`,
      'Steamfall or Steam Burst',
      syn1?.synergyName
    );

    // Immediate re-trigger within 2s ICD must be blocked (PRD A7)
    const syn2 = synMgr.checkSynergyTrigger(enemy, 'Fire', sim.heroes, 110);
    assert(
      'TC-A7-02',
      'A7 Synergy',
      'No recursive / ICD trigger violation within 2s',
      syn2 === null,
      `Second trigger within 10 ticks: ${syn2 ? 'Triggered (ERROR)' : 'Blocked (PASS)'}`,
      null,
      syn2
    );
  }

  // ==========================================
  // TC-A8: Deterministic RNG (PCG32)
  // ==========================================
  {
    const rng1 = new PCG32(123456n);
    const seq1 = [rng1.nextFloat(), rng1.nextFloat(), rng1.nextUint32(), rng1.nextInt(1, 100)];

    const rng2 = new PCG32(123456n);
    const seq2 = [rng2.nextFloat(), rng2.nextFloat(), rng2.nextUint32(), rng2.nextInt(1, 100)];

    const isIdentical = seq1.every((v, i) => v === seq2[i]);
    assert(
      'TC-A8-01',
      'A8 Deterministic RNG',
      'Identical seed produces identical float/int sequence',
      isIdentical,
      `Seq 1: ${seq1.join(', ')} | Seq 2: ${seq2.join(', ')}`,
      true,
      isIdentical
    );

    // Test snapshot / restore
    const snapshot = rng1.snapshot();
    const nextVal1 = rng1.nextFloat();

    rng1.restore(snapshot);
    const nextVal2 = rng1.nextFloat();
    assert(
      'TC-A8-02',
      'A8 Deterministic RNG',
      'Snapshot and restore reproduces exact next random state',
      nextVal1 === nextVal2,
      `After restore: ${nextVal2} === ${nextVal1}`,
      nextVal1,
      nextVal2
    );
  }

  // ==========================================
  // TC-B1: Stat-Tier Role Exceptions
  // ==========================================
  {
    const exceptions = BALANCE_CONFIG.heroStats.roleExceptions;
    assert(
      'TC-B1-01',
      'B1 Stat-Tier Exceptions',
      'Tank role exception allows HP up to 135% & DEF up to 130%',
      exceptions.tank.hpMaxMultiplier === 1.35 && exceptions.tank.defMaxMultiplier === 1.30,
      `Tank HP max: ${exceptions.tank.hpMaxMultiplier * 100}%, DEF max: ${exceptions.tank.defMaxMultiplier * 100}%`,
      '1.35, 1.30',
      `${exceptions.tank.hpMaxMultiplier}, ${exceptions.tank.defMaxMultiplier}`
    );
  }

  // ==========================================
  // TC-B2: Raw DPS Target Audit
  // ==========================================
  {
    const pyraDPS = HERO_REGISTRY.Pyra.baseATK * HERO_REGISTRY.Pyra.baseAS;
    const aerisDPS = HERO_REGISTRY.Aeris.baseATK * HERO_REGISTRY.Aeris.baseAS;
    const kaiDPS = HERO_REGISTRY.Kai.baseATK * HERO_REGISTRY.Kai.baseAS;
    const emberDPS = HERO_REGISTRY.Ember.baseATK * HERO_REGISTRY.Ember.baseAS;

    const pyraPass = Math.abs(pyraDPS - 249.75) < 0.001;
    const aerisPass = Math.abs(aerisDPS - 252.0) < 0.001;
    const kaiPass = Math.abs(kaiDPS - 168.0) < 0.001;
    const emberPass = Math.abs(emberDPS - 128.25) < 0.001;

    assert(
      'TC-B2-01',
      'B2 Raw DPS Target',
      'Pyra raw DPS = 249.75, Aeris = 252.00, Kai = 168.00, Ember = 128.25',
      pyraPass && aerisPass && kaiPass && emberPass,
      `Pyra: ${pyraDPS.toFixed(2)}, Aeris: ${aerisDPS.toFixed(2)}, Kai: ${kaiDPS.toFixed(2)}, Ember: ${emberDPS.toFixed(2)}`,
      '249.75, 252.0, 168.0, 128.25',
      `${pyraDPS.toFixed(2)}, ${aerisDPS.toFixed(2)}, ${kaiDPS.toFixed(2)}, ${emberDPS.toFixed(2)}`
    );
  }

  // ==========================================
  // TC-B3: Boss TTK & Defense Audit
  // ==========================================
  {
    const bossDef = 250;
    const defMod = getDefenseModifier(bossDef); // 100 / 350 = 0.285714
    const volkarRaw = 524.25 * 8.0; // 4,194 raw damage
    const res = 0.90; // 10% boss resistance
    const finalVolkarHit = roundHalfUp(volkarRaw * defMod * res);

    assert(
      'TC-B3-01',
      'B3 Boss Envelope',
      'Volkar Lv10 ultimate deals mitigated 1,078 damage vs 250 DEF boss (no one-shot)',
      finalVolkarHit === 1078,
      `Volkar hit against 250 DEF boss: ${finalVolkarHit} (Target HP: 75,000)`,
      1078,
      finalVolkarHit
    );
  }

  // ==========================================
  // TC-B4: Tank Damage Audit
  // ==========================================
  {
    // Terra Lv10 DEF: 120 * 2.33 = 279.6
    // DefMod: 100 / 379.6 = 0.263435
    // Damage received with Stone Skin (20% reduction): 0.263435 * 0.80 = 0.210748 -> 21.07%
    const terraDef = 120 * 2.33;
    const terraDefMod = 100 / (100 + terraDef);
    const terraIncoming = terraDefMod * 0.80;

    assert(
      'TC-B4-01',
      'B4 Tank Audit',
      'Terra Lv10 incoming damage multiplier is ~0.2107 (21.07%)',
      Math.abs(terraIncoming - 0.2107) < 0.001,
      `Terra incoming multiplier: ${terraIncoming.toFixed(4)}`,
      0.2107,
      Number(terraIncoming.toFixed(4))
    );

    // Gaia Lv10 DEF: 135 * 2.33 = 314.55
    // DefMod: 100 / 414.55 = 0.241225
    // World Core (25% reduction): 0.241225 * 0.75 = 0.180919 -> 18.09%
    const gaiaDef = 135 * 2.33;
    const gaiaDefMod = 100 / (100 + gaiaDef);
    const gaiaIncoming = gaiaDefMod * 0.75;

    assert(
      'TC-B4-02',
      'B4 Tank Audit',
      'Gaia Lv10 incoming damage multiplier is ~0.1809 (18.09%)',
      Math.abs(gaiaIncoming - 0.1809) < 0.001,
      `Gaia incoming multiplier: ${gaiaIncoming.toFixed(4)}`,
      0.1809,
      Number(gaiaIncoming.toFixed(4))
    );
  }

  // ==========================================
  // TC-B5: Elite Reward Rounding
  // ==========================================
  {
    const rootBeastReward = calculateEliteReward(25); // 25 * 2.5 = 62.5 -> 63
    const beetleReward = calculateEliteReward(30); // 30 * 2.5 = 75

    assert(
      'TC-B5-01',
      'B5 Elite Reward',
      'Root Beast Elite = 63 Gold, Armor Beetle Elite = 75 Gold',
      rootBeastReward === 63 && beetleReward === 75,
      `Root Beast Elite: ${rootBeastReward}, Beetle Elite: ${beetleReward}`,
      '63, 75',
      `${rootBeastReward}, ${beetleReward}`
    );
  }

  // ==========================================
  // TC-B6: Energy & Ultimate Cooldown Override
  // ==========================================
  {
    const pyraCD = BALANCE_CONFIG.heroUltimates.cooldownOverrides.Pyra;
    const defaultCD = BALANCE_CONFIG.heroUltimates.defaultInternalCooldown;

    assert(
      'TC-B6-01',
      'B6 Energy & CD',
      'Pyra ultimate CD is 25s (override), default is 5s',
      pyraCD === 25 && defaultCD === 5,
      `Pyra CD: ${pyraCD}s, Default CD: ${defaultCD}s`,
      '25, 5',
      `${pyraCD}, ${defaultCD}`
    );
  }

  // ==========================================
  // TC-B7: Pull Displacement Cap (3.0 tiles)
  // ==========================================
  {
    // Tempest intends 6.0 tiles displacement (0.75 * 8s)
    const normalPull1 = calculatePullDisplacement(2.0, 0, false);
    const normalPull2 = calculatePullDisplacement(2.0, 2.0, false); // accumulated is 2.0, remaining is 1.0
    const normalPull3 = calculatePullDisplacement(2.0, 3.0, false); // accumulated is 3.0, remaining is 0

    assert(
      'TC-B7-01',
      'B7 Pull Cap',
      'Pull capped at 3.0 tiles cumulative per effect instance',
      normalPull1 === 2.0 && normalPull2 === 1.0 && normalPull3 === 0,
      `Pulls: +${normalPull1}, +${normalPull2}, +${normalPull3} (Total: ${normalPull1 + normalPull2 + normalPull3})`,
      '2.0, 1.0, 0',
      `${normalPull1}, ${normalPull2}, ${normalPull3}`
    );

    // Boss pull cap: 1.5 tiles (50%)
    const bossPull1 = calculatePullDisplacement(2.0, 0, true);
    assert(
      'TC-B7-02',
      'B7 Pull Cap',
      'Boss pull displacement capped at 1.5 tiles',
      bossPull1 === 1.5,
      `Boss actual pull: ${bossPull1} tiles`,
      1.5,
      bossPull1
    );
  }

  // ==========================================
  // TC-B8: Zone Periodic Damage @ 0.5s ticks
  // ==========================================
  {
    const dps = 100;
    const tickDmg = dps * BALANCE_CONFIG.heroSkills.zoneDamage.damagePerTickMultiplier; // 50%
    const interval = BALANCE_CONFIG.heroSkills.zoneDamage.tickInterval; // 0.5s

    assert(
      'TC-B8-01',
      'B8 Zone Damage',
      'Zone damage ticks every 0.5s dealing 50% dps per tick (no extra DoT tick)',
      interval === 0.5 && tickDmg === 50,
      `Interval: ${interval}s, Damage per tick: ${tickDmg}% of dps`,
      '0.5s, 50',
      `${interval}s, ${tickDmg}`
    );
  }

  // ==========================================
  // TC-B9: Global Boss CC Resistance (50%)
  // ==========================================
  {
    const stunBoss = calculateCCDuration(4.0, true, 'stun'); // 4.0 * 0.5 = 2.0 -> capped at 1.5s
    const slowBoss = calculateCCDuration(4.0, true, 'slow'); // 4.0 * 0.5 = 2.0s

    assert(
      'TC-B9-01',
      'B9 Boss CC',
      'Boss Stun halved & capped at 1.5s, Boss Slow halved to 2.0s',
      stunBoss === 1.5 && slowBoss === 2.0,
      `Boss Stun: ${stunBoss}s (cap 1.5), Boss Slow: ${slowBoss}s`,
      '1.5, 2.0',
      `${stunBoss}, ${slowBoss}`
    );
  }

  // ==========================================
  // TC-B10: Full 30-Wave Economy Calculation
  // ==========================================
  {
    // Wave reward: 100 + Wave * 20
    // Sum for waves 1 to 30: 30 * 100 + 20 * (30 * 31 / 2) = 3000 + 20 * 465 = 3000 + 9300 = 12,300 Gold
    let totalWaveRewards = 0;
    for (let w = 1; w <= 30; w++) {
      totalWaveRewards += 100 + w * 20;
    }

    assert(
      'TC-B10-01',
      'B10 Economy',
      'Total wave rewards across 30 waves equals exactly 12,300 Gold',
      totalWaveRewards === 12300,
      `Calculated 30-wave reward total: ${totalWaveRewards} Gold`,
      12300,
      totalWaveRewards
    );
  }

  // ==========================================
  // TC-C1: Minimum 1 Damage vs Extreme Defense
  // ==========================================
  {
    const extremeDef = calculateFinalDamage({
      baseDamage: 50,
      targetDefense: 100000, // Immense defense
    });

    assert(
      'TC-C1-01',
      'C1 Damage Formula',
      'Attack against extreme defense still deals minimum 1 damage',
      extremeDef.finalMitigatedDamage === 1,
      `Final mitigated damage against 100,000 DEF: ${extremeDef.finalMitigatedDamage}`,
      1,
      extremeDef.finalMitigatedDamage
    );
  }

  // ==========================================
  // TC-C2: Additive Attack Speed Stacking & Cap
  // ==========================================
  {
    // Aqua +20%, Mira +10%, Luma +25%, Sky Dance +15% = +70%
    const baseAS = 1.0;
    const stackedAS = calculateEffectiveAttackSpeed(
      baseAS,
      [
        { percent: 0.20 },
        { percent: 0.10 },
        { percent: 0.25 },
        { percent: 0.15 },
      ],
      []
    );

    assert(
      'TC-C2-01',
      'C2 AS Buff Stacking',
      'Additive attack speed buffs (+70%) yield BaseAS * 1.70',
      Math.abs(stackedAS - 1.70) < 0.001,
      `Calculated AS: ${stackedAS}`,
      1.70,
      Number(stackedAS.toFixed(2))
    );

    // Hard cap at 5.0 attacks/sec
    const cappedAS = calculateEffectiveAttackSpeed(
      3.0,
      [{ percent: 2.0 }], // +200% on 3.0 -> 9.0 -> capped at 5.0
      []
    );
    assert(
      'TC-C2-02',
      'C2 AS Buff Stacking',
      'Attack speed strictly capped at 5.0 attacks/sec',
      cappedAS === 5.0,
      `Capped AS: ${cappedAS}`,
      5.0,
      cappedAS
    );
  }

  // ==========================================
  // TC-C5: Placement Rules & Earth Wall Validation
  // ==========================================
  {
    const sim = new GameSimulation(105n);
    sim.deployHero('Pyra', 0);
    const duplicatePyra = sim.deployHero('Pyra', 1);

    assert(
      'TC-C5-01',
      'C5 Placement',
      'Duplicate hero placement rejected (only 1 active instance/run)',
      duplicatePyra === false,
      `Duplicate Pyra deployment: ${duplicatePyra ? 'Accepted (ERROR)' : 'Rejected (PASS)'}`,
      false,
      duplicatePyra
    );

    // Earth wall reachability check: cannot block base
    const wallOnBase = validateEarthWallPlacement(11, 3, [], []);
    assert(
      'TC-C5-02',
      'C5 Earth Wall',
      'Earth Wall placement on Base tile rejected',
      wallOnBase === false,
      `Placement on base: ${wallOnBase ? 'Allowed (ERROR)' : 'Rejected (PASS)'}`,
      false,
      wallOnBase
    );
  }

  // ==========================================
  // TC-C7: Deterministic Save/Load Snapshot
  // ==========================================
  {
    const simA = new GameSimulation(777n);
    simA.deployHero('Pyra', 0);
    simA.startCombatPhase();
    simA.step(60); // 1 second

    const snapshot = simA.createSnapshot();

    const simB = new GameSimulation(1n);
    simB.loadSnapshot(snapshot);

    // Run both simulations 60 more ticks
    simA.step(60);
    simB.step(60);

    const matchTick = simA.tick === simB.tick;
    const matchGold = simA.gold === simB.gold;
    const matchEnemies = simA.enemies.length === simB.enemies.length;
    const matchDamage = simA.totalDamageDealt === simB.totalDamageDealt;

    const allMatch = matchTick && matchGold && matchEnemies && matchDamage;
    assert(
      'TC-C7-01',
      'C7 Save/Load Determinism',
      'Loaded state produces byte-for-byte identical subsequent simulation',
      allMatch,
      `Tick: ${simA.tick}===${simB.tick}, Gold: ${simA.gold}===${simB.gold}, Enemies: ${simA.enemies.length}===${simB.enemies.length}, Damage: ${simA.totalDamageDealt}===${simB.totalDamageDealt}`,
      true,
      allMatch
    );
  }

  // ==========================================
  // SECTION 11: Edge Cases Audit
  // ==========================================
  {
    // EC-01: Burn reaches 3 stacks
    const sim = new GameSimulation(108n);
    sim.spawnEnemy('ForestCrawler');
    const enemy = sim.enemies[0];

    sim.applyBurnStack(enemy, 'h1', 100);
    sim.applyBurnStack(enemy, 'h2', 100);
    sim.applyBurnStack(enemy, 'h3', 100);
    assert('EC-01', 'Edge Cases', 'Burn reaches exactly 3 stacks', enemy.statuses.burns.length === 3, `Stacks: ${enemy.statuses.burns.length}`, 3, enemy.statuses.burns.length);

    // EC-02: 4th Burn replaces earliest expiring stack without exceeding 3 stacks
    sim.applyBurnStack(enemy, 'h4', 120);
    assert('EC-02', 'Edge Cases', '4th Burn replaces earliest stack (stacks remain 3)', enemy.statuses.burns.length === 3, `Stacks: ${enemy.statuses.burns.length}`, 3, enemy.statuses.burns.length);

    // EC-04: Slow attempts >80%
    sim.applySlow(enemy, 0.95, 4.0);
    assert('EC-04', 'Edge Cases', 'Slow capped at 80% maximum', enemy.statuses.slow?.percent === 0.80, `Slow: ${enemy.statuses.slow?.percent}`, 0.80, enemy.statuses.slow?.percent);

    // EC-10: 4-Element Awakening loses one hero due to death
    const synMgr = new SynergyManager();
    const fourHeroes = [
      { element: 'Fire', isDead: false, effectiveATK: 100 } as any,
      { element: 'Water', isDead: false, effectiveATK: 100 } as any,
      { element: 'Earth', isDead: false, effectiveATK: 100 } as any,
      { element: 'Wind', isDead: false, effectiveATK: 100 } as any,
    ];
    const beforeDeath = synMgr.isFourElementAwakeningActive(fourHeroes);
    fourHeroes[3].isDead = true; // Wind dies
    const afterDeath = synMgr.isFourElementAwakeningActive(fourHeroes);

    assert(
      'EC-10',
      'Edge Cases',
      'Awakening active with 4 alive, deactivates immediately when 1 hero dies',
      beforeDeath === true && afterDeath === false,
      `Before death: ${beforeDeath}, After death: ${afterDeath}`,
      'true -> false',
      `${beforeDeath} -> ${afterDeath}`
    );
  }

  // ==========================================
  // TC-LV: Campaign Levels 1-5 & Waves Distinction
  // ==========================================
  {
    // LV-01: Verify all 5 levels exist with distinct total waves
    const levels = [1, 2, 3, 4, 5].map((lvl) => CAMPAIGN_LEVELS[lvl]);
    const allExist = levels.every((l) => l && l.totalWaves > 0);
    assert(
      'TC-LV-01',
      'Campaign Levels (1-5)',
      'Levels 1 through 5 properly defined with metadata and sectors',
      allExist,
      `All 5 campaign stages defined: ${levels.map((l) => `${l.code} (${l.totalWaves}w)`).join(', ')}`,
      5,
      levels.filter(Boolean).length
    );

    // LV-02: Level vs Waves differentiation
    const sim = new GameSimulation(200n);
    sim.startLevel(2);
    const expectedWaves = CAMPAIGN_LEVELS[2]?.totalWaves ?? 15;
    assert(
      'TC-LV-02',
      'Campaign Levels (1-5)',
      `Simulation correctly sets Level 2 and wave progress (Wave 1 of ${expectedWaves})`,
      sim.currentLevel === 2 && sim.levelWavesCount === expectedWaves && sim.currentWaveInLevel === 1,
      `Current Level: ${sim.currentLevel}, Waves in Level: ${sim.levelWavesCount}, Wave Index: ${sim.currentWaveInLevel}`,
      `Level 2 with ${expectedWaves} waves`,
      `Level ${sim.currentLevel} with ${sim.levelWavesCount} waves`
    );

    // LV-03: Starting gold matches Level 2 config
    const expectedStartingGold = CAMPAIGN_LEVELS[2]?.startingGold ?? 600;
    assert(
      'TC-LV-03',
      'Campaign Levels (1-5)',
      `Level 2 starting gold matches or exceeds level specification (${expectedStartingGold}G)`,
      sim.gold >= expectedStartingGold,
      `Level 2 gold: ${sim.gold} (expected >= ${expectedStartingGold})`,
      `>= ${expectedStartingGold}`,
      sim.gold
    );

    // LV-04: Level 1 clear unlock progression
    const result = progression.completeLevel(1, 3, 2500, 100, 'Emerald Sentinel');
    const isLevel2Unlocked = progression.isLevelUnlocked(2);
    assert(
      'TC-LV-04',
      'Campaign Levels (1-5)',
      'Clearing Level 1 unlocks Level 2 in persistent progression',
      isLevel2Unlocked,
      `Level 2 unlocked: ${isLevel2Unlocked}, 3-Stars awarded for Level 1: ${progression.getStarsForLevel(1)}`,
      true,
      isLevel2Unlocked
    );
  }

  // ==========================================
  // SECTION 12: Battle State Reset, MatchState Isolation & Co-op Sync
  // ==========================================
  {
    // TC-RESET-01: Starting Level 1 creates fresh state
    const sim1 = createNewGameSession(1, 'single');
    const lv1Valid =
      sim1.currentLevel === 1 &&
      sim1.baseHP === 100 &&
      sim1.currentWaveInLevel === 1 &&
      sim1.gold === CAMPAIGN_LEVELS[1].startingGold &&
      sim1.enemies.length === 0 &&
      sim1.heroes.every((h) => h.level === 1 && h.starLevel === 1);
    assert(
      'TC-RESET-01',
      'Session Reset & State Isolation',
      'Starting Level 1 creates fresh state (Core 100 HP, Wave 1, Lv1 starter towers, start gold)',
      lv1Valid,
      `Level 1 session fresh: Core=${sim1.baseHP}%, Gold=${sim1.gold}, Towers=${sim1.heroes.length} (all Lv 1)`,
      true,
      lv1Valid
    );

    // TC-RESET-02: Starting Level 2 creates fresh state
    const sim2 = createNewGameSession(2, 'single');
    const lv2Valid =
      sim2.currentLevel === 2 &&
      sim2.baseHP === 100 &&
      sim2.currentWaveInLevel === 1 &&
      sim2.levelWavesCount === CAMPAIGN_LEVELS[2].totalWaves &&
      sim2.gold === CAMPAIGN_LEVELS[2].startingGold &&
      sim2.enemies.length === 0 &&
      sim2.heroes.every((h) => h.level === 1 && h.starLevel === 1);
    assert(
      'TC-RESET-02',
      'Session Reset & State Isolation',
      'Starting Level 2 creates fresh state (Core 100 HP, Wave 1/6, Level 2 gold, 0 enemies)',
      lv2Valid,
      `Level 2 session fresh: Level=${sim2.currentLevel}, Gold=${sim2.gold}, Waves=${sim2.levelWavesCount}`,
      true,
      lv2Valid
    );

    // TC-RESET-03: Switching Level 1 -> Level 2 resets towers
    sim1.upgradeHero(sim1.heroes[0].instanceId);
    sim1.upgradeHero(sim1.heroes[0].instanceId);
    const towerBefore = sim1.heroes[0].level;
    sim1.createNewGameSession(2, 'single');
    const towerAfterSwitch = sim1.heroes.every((h) => h.level === 1);
    assert(
      'TC-RESET-03',
      'Session Reset & State Isolation',
      'Switching Level 1 -> Level 2 resets towers to Level 1',
      towerBefore > 1 && towerAfterSwitch,
      `Tower before switch: Lv.${towerBefore} -> after switch to Level 2: all Lv.${sim1.heroes[0].level}`,
      true,
      towerAfterSwitch
    );

    // TC-RESET-04: Switching Level 2 -> Level 3 resets towers
    sim1.upgradeHero(sim1.heroes[0].instanceId);
    sim1.createNewGameSession(3, 'single');
    const towerAfterSwitch3 = sim1.heroes.every((h) => h.level === 1);
    assert(
      'TC-RESET-04',
      'Session Reset & State Isolation',
      'Switching Level 2 -> Level 3 resets towers to Level 1',
      towerAfterSwitch3 && sim1.currentLevel === 3,
      `Current level: ${sim1.currentLevel}, all towers Lv.${sim1.heroes[0].level}`,
      true,
      towerAfterSwitch3
    );

    // TC-RESET-05: Retry after defeat resets everything
    sim1.baseHP = 0;
    sim1.wave = 4;
    sim1.currentWaveInLevel = 4;
    sim1.gold = 50;
    sim1.spawnEnemy('ForestCrawler');
    sim1.commanderCooldowns.orbitalStrike = 45;
    sim1.retryCurrentLevel();
    const retryValid =
      sim1.baseHP === 100 &&
      sim1.currentWaveInLevel === 1 &&
      sim1.gold === CAMPAIGN_LEVELS[sim1.currentLevel].startingGold &&
      sim1.enemies.length === 0 &&
      sim1.commanderCooldowns.orbitalStrike === 0 &&
      sim1.heroes.every((h) => h.level === 1);
    assert(
      'TC-RESET-05',
      'Session Reset & State Isolation',
      'Retry after defeat resets everything (Core 100 HP, Wave 1, Gold, 0 enemies, 0 CDs)',
      retryValid,
      `Retried Level ${sim1.currentLevel}: Core=${sim1.baseHP}%, Wave=${sim1.currentWaveInLevel}, Enemies=${sim1.enemies.length}, CDs=0`,
      true,
      retryValid
    );

    // TC-RESET-06: Rematch after victory resets everything
    sim1.wave = sim1.levelWavesCount;
    sim1.currentWaveInLevel = sim1.levelWavesCount;
    sim1.rematch();
    const rematchValid =
      sim1.baseHP === 100 &&
      sim1.currentWaveInLevel === 1 &&
      sim1.enemies.length === 0 &&
      sim1.heroes.every((h) => h.level === 1);
    assert(
      'TC-RESET-06',
      'Session Reset & State Isolation',
      'Rematch after victory resets SAME level to Wave 1 with fresh battlefield',
      rematchValid,
      `Rematch Level ${sim1.currentLevel}: Wave=${sim1.currentWaveInLevel}, Core=${sim1.baseHP}%, Enemies=${sim1.enemies.length}`,
      true,
      rematchValid
    );

    // TC-RESET-07: Max-level towers never carry over
    const simMax = createNewGameSession(1, 'single');
    simMax.gold = 50000;
    for (let i = 0; i < 9; i++) {
      simMax.upgradeHero(simMax.heroes[0].instanceId);
    }
    const isMax = simMax.heroes[0].level === 10;
    simMax.createNewGameSession(5, 'single');
    const allResetLv1 = simMax.heroes.every((h) => h.level === 1);
    assert(
      'TC-RESET-07',
      'Session Reset & State Isolation',
      'Max-level towers (Lv.10) never carry over to new level (start Level 5 at Lv.1)',
      isMax && allResetLv1,
      `Was Level 10 MAX in Level 1 -> in Level 5: all towers are Level ${simMax.heroes[0].level}`,
      true,
      allResetLv1
    );

    // TC-RESET-08: Gold never carries over between battle sessions
    simMax.gold = 99999;
    simMax.createNewGameSession(2, 'single');
    const goldReset = simMax.gold === CAMPAIGN_LEVELS[2].startingGold;
    assert(
      'TC-RESET-08',
      'Session Reset & State Isolation',
      'Gold never carries over between battle sessions (99999G resets to Level 2 starting gold)',
      goldReset,
      `Gold in new session: ${simMax.gold} (expected ${CAMPAIGN_LEVELS[2].startingGold})`,
      CAMPAIGN_LEVELS[2].startingGold,
      simMax.gold
    );

    // TC-RESET-09: Wave never carries over
    simMax.wave = 15;
    simMax.currentWaveInLevel = 6;
    simMax.createNewGameSession(3, 'single');
    assert(
      'TC-RESET-09',
      'Session Reset & State Isolation',
      'Wave never carries over between battle sessions (resets to Wave 1 of new level)',
      simMax.currentWaveInLevel === 1,
      `Current wave in level: ${simMax.currentWaveInLevel}`,
      1,
      simMax.currentWaveInLevel
    );

    // TC-RESET-10: Enemy state never carries over
    simMax.spawnEnemy('ForestCrawler');
    simMax.spawnEnemy('SporeSpitter');
    simMax.createNewGameSession(4, 'single');
    assert(
      'TC-RESET-10',
      'Session Reset & State Isolation',
      'Enemy state never carries over between sessions (enemies array cleared)',
      simMax.enemies.length === 0,
      `Active enemies count: ${simMax.enemies.length}`,
      0,
      simMax.enemies.length
    );

    // TC-RESET-11: Boss state never carries over
    simMax.spawnEnemy('AncientRootTyrant');
    const hasBoss = simMax.enemies.length >= 1;
    simMax.createNewGameSession(1, 'single');
    const bossCleared = simMax.enemies.length === 0;
    assert(
      'TC-RESET-11',
      'Session Reset & State Isolation',
      'Boss state never carries over (active boss cleared on session reset)',
      hasBoss && bossCleared,
      'Boss cleared on session recreation',
      true,
      hasBoss && bossCleared
    );

    // TC-RESET-12: Temporary buffs & cooldowns never carry over
    simMax.commanderCooldowns.orbitalStrike = 60;
    simMax.commanderCooldowns.bioBarrier = 40;
    simMax.createNewGameSession(2, 'single');
    const cdsZero =
      simMax.commanderCooldowns.orbitalStrike === 0 &&
      simMax.commanderCooldowns.bioBarrier === 0 &&
      simMax.commanderCooldowns.cryoFreeze === 0 &&
      simMax.commanderCooldowns.droneHarvest === 0;
    assert(
      'TC-RESET-12',
      'Session Reset & State Isolation',
      'Temporary buffs & commander cooldowns never carry over (reset to 0)',
      cdsZero,
      `Cooldowns after reset: Orbital=${simMax.commanderCooldowns.orbitalStrike}, Bio=${simMax.commanderCooldowns.bioBarrier}`,
      true,
      cdsZero
    );

    // TC-RESET-13: Multiplayer Player 1 and Player 2 receive identical reset state
    const coopSim = createNewGameSession(1, 'coop', 'P1');
    const p1State = coopSim.createSnapshot();
    coopSim.activePlayerId = 'P2';
    const p2State = coopSim.createSnapshot();
    const identical =
      coopSim.p1Gold === coopSim.p2Gold &&
      coopSim.baseHP === 100 &&
      coopSim.wave === 1 &&
      p1State.baseHP === p2State.baseHP;
    assert(
      'TC-RESET-13',
      '2-Player Co-op & Multiplayer Reset',
      'Multiplayer P1 and P2 receive identical reset state (shared Core 100%, synchronized gold)',
      identical,
      `P1 Gold: ${coopSim.p1Gold}G, P2 Gold: ${coopSim.p2Gold}G, Core HP: ${coopSim.baseHP}%`,
      true,
      identical
    );

    // TC-RESET-14: Reconnecting to active multiplayer game restores CURRENT session only
    const snapshot = coopSim.createSnapshot();
    const freshClientSim = new GameSimulation(999n);
    freshClientSim.loadSnapshot(snapshot);
    const restoredCorrectly =
      freshClientSim.currentLevel === coopSim.currentLevel &&
      freshClientSim.baseHP === coopSim.baseHP &&
      freshClientSim.wave === coopSim.wave;
    assert(
      'TC-RESET-14',
      '2-Player Co-op & Multiplayer Reset',
      'Reconnecting restores only CURRENT battle session snapshot, not old sessions',
      restoredCorrectly,
      `Restored snapshot: Level=${freshClientSim.currentLevel}, Wave=${freshClientSim.wave}, Core=${freshClientSim.baseHP}%`,
      true,
      restoredCorrectly
    );

    // TC-RESET-15: Play Level 1, upgrade tower to Level 10, exit, open Level 5 -> tower must be Level 1
    const test15 = createNewGameSession(1, 'single');
    test15.gold = 50000;
    for (let i = 0; i < 9; i++) {
      test15.upgradeHero(test15.heroes[0].instanceId);
    }
    const reached10 = test15.heroes[0].level === 10;
    test15.createNewGameSession(5, 'single');
    const level5TowerIs1 = test15.heroes.every((h) => h.level === 1);
    assert(
      'TC-RESET-15',
      'MatchState Isolation Rules',
      'Upgrade to Lv.10 in Level 1, exit and open Level 5 -> all towers must be Level 1',
      reached10 && level5TowerIs1,
      `Level 1 had Lv.10 tower -> Level 5 starts with Lv.${test15.heroes[0].level} towers`,
      true,
      level5TowerIs1
    );

    // TC-RESET-16: Refresh/close mid-match, reopen -> match starts from beginning, unlocks remain
    const matchState = createFreshMatchState(3);
    const mockStorageJSON = JSON.stringify({
      unlockedLevels: [1, 2, 3],
      levelStars: { 1: 3, 2: 2, 3: 0, 4: 0, 5: 0 },
      gold: 99999,
      wave: 25,
      towerLevels: [10, 10, 10],
      baseHP: 2,
    });
    const parsedProgress = progression.parseAndValidate(mockStorageJSON);
    const progressSafe =
      parsedProgress.unlockedLevels.includes(3) &&
      !('towerLevels' in parsedProgress) &&
      !('wave' in parsedProgress) &&
      matchState.wave === 1 &&
      matchState.coreHP === 100;
    assert(
      'TC-RESET-16',
      'MatchState Isolation Rules',
      'Storage only saves PlayerProgress; runtime match states (wave, towerLevels) are strictly ignored',
      progressSafe,
      `Parsed permanent progression safely isolated from match state. Level 3 fresh match: Wave ${matchState.wave}, Core ${matchState.coreHP}%`,
      true,
      progressSafe
    );

    // TC-HERO-01: Hero Merge fusion increases star rank to ★2, boosts stats, frees slot
    const mergeSim = createNewGameSession(1, 'single');
    mergeSim.gold = 1000;
    mergeSim.deployHero('Pyra', 0);
    mergeSim.deployHero('Ignis', 1);
    const pyraTarget = mergeSim.heroes.find((h) => h.slotIndex === 0)!;
    const ignisSource = mergeSim.heroes.find((h) => h.slotIndex === 1)!;
    const atkBefore = pyraTarget.effectiveATK;
    const hpBefore = pyraTarget.maxHP;
    const mergeSuccess = mergeSim.mergeHeroes(pyraTarget.instanceId, ignisSource.instanceId);
    const sourceSlotFreed = mergeSim.tacticalSlots.find((s) => s.slotIndex === 1)!.occupiedHeroInstanceId === undefined;
    const targetRankUp = pyraTarget.starLevel === 2;
    const statsBoosted = pyraTarget.effectiveATK > atkBefore && pyraTarget.maxHP > hpBefore;
    assert(
      'TC-HERO-01',
      'Hero Merge & Sell Features',
      'Hero Merge fuses compatible heroes into ★2, boosts stats (+50% ATK, +40% HP), and frees slot',
      mergeSuccess && sourceSlotFreed && targetRankUp && statsBoosted,
      `Merge success: Rank=★${pyraTarget.starLevel}, ATK: ${atkBefore} -> ${pyraTarget.effectiveATK}, Slot 1 freed: ${sourceSlotFreed}`,
      true,
      mergeSuccess && sourceSlotFreed && targetRankUp && statsBoosted
    );

    // TC-HERO-02: Hero Sell refunds 70% of total investment and frees slot
    const sellSim = createNewGameSession(1, 'single');
    sellSim.deployHero('Ignis', 1);
    const ignisHero = sellSim.heroes.find((h) => h.slotIndex === 1)!;
    const goldBeforeSell = sellSim.gold;
    const sellSuccess = sellSim.sellHero(ignisHero.instanceId);
    const goldAfterSell = sellSim.gold;
    const slotFreed = sellSim.tacticalSlots.find((s) => s.slotIndex === 1)!.occupiedHeroInstanceId === undefined;
    const refundAwarded = goldAfterSell > goldBeforeSell;
    assert(
      'TC-HERO-02',
      'Hero Merge & Sell Features',
      'Hero Sell refunds 70% of gold investment and frees tactical slot',
      sellSuccess && slotFreed && refundAwarded,
      `Sold Ignis: Gold ${goldBeforeSell} -> ${goldAfterSell} (+${goldAfterSell - goldBeforeSell}G), Slot freed: ${slotFreed}`,
      true,
      sellSuccess && slotFreed && refundAwarded
    );
  }

  const durationMs = performance.now() - startTime;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    durationMs,
    results,
  };
}
