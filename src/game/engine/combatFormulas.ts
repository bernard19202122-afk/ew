/**
 * Elemental Wildguard - Combat Formulas and Status Stacking Engine
 * Strictly follows PRD v2.2 Section C1, C2, C3, C4, B1-B9, and BalanceConfig.
 */

import { BALANCE_CONFIG } from '../config/balanceConfig';
import { Element, EnemyClass, Rarity } from '../types/gameTypes';

/**
 * Deterministic RoundHalfUp rounding as mandated by PRD Section C1.
 */
export function roundHalfUp(num: number): number {
  const sign = num >= 0 ? 1 : -1;
  return sign * Math.floor(Math.abs(num) + 0.5);
}

/**
 * Element Advantage cycle:
 * Fire -> Earth -> Wind -> Water -> Fire
 * Advantage: +15% (1.15)
 * Disadvantage: -15% (0.85)
 * Neutral: 1.00
 */
export function getElementModifier(attackerElement: Element, defenderElement: Element): number {
  const cycle = BALANCE_CONFIG.synergy.elementCycle;
  if (cycle[attackerElement] === defenderElement) {
    return BALANCE_CONFIG.synergy.advantageMultiplier; // 1.15
  }
  if (cycle[defenderElement] === attackerElement) {
    return BALANCE_CONFIG.synergy.disadvantageMultiplier; // 0.85
  }
  return 1.0;
}

/**
 * Defense modifier formula:
 * DefenseModifier = 100 / (100 + TargetDefense)
 */
export function getDefenseModifier(targetDefense: number): number {
  if (targetDefense <= 0) return 1.0;
  return 100 / (100 + targetDefense);
}

export interface DamageCalculationParams {
  baseDamage: number;
  attackerElement?: Element;
  defenderElement?: Element;
  attackModifier?: number;
  isCrit?: boolean;
  critDamageMultiplier?: number;
  skillModifier?: number;
  synergyModifier?: number;
  targetDefense: number;
  damageTakenReduction?: number; // e.g. 0.20 for Stone Skin -> 0.80 multiplier
  isBossOrMiniBoss?: boolean;
  terrainBonus?: number;
}

export interface DamageResult {
  rawDamage: number;
  elementModifier: number;
  critModifier: number;
  defenseModifier: number;
  damageTakenModifier: number;
  bossResistanceModifier: number;
  finalMitigatedDamage: number;
}

/**
 * PRD C1 Final Damage Calculation:
 * FinalDamage = BaseDamage * AttackModifier * ElementModifier * CriticalModifier
 *               * SkillModifier * SynergyModifier * DefenseModifier
 *               * DamageTakenModifier * BossResistanceModifier
 */
export function calculateFinalDamage(params: DamageCalculationParams): DamageResult {
  const baseDamage = Math.max(0, params.baseDamage);
  const attackMod = params.attackModifier ?? 1.0;
  const terrainMod = 1.0 + (params.terrainBonus ?? 0);

  const elementMod =
    params.attackerElement && params.defenderElement
      ? getElementModifier(params.attackerElement, params.defenderElement)
      : 1.0;

  const critMod = params.isCrit ? (params.critDamageMultiplier ?? 1.5) : 1.0;
  const skillMod = params.skillModifier ?? 1.0;
  const synergyMod = params.synergyModifier ?? 1.0;

  const defenseMod = getDefenseModifier(params.targetDefense);

  // Damage taken reduction is additive (PRD C1: 1 - sum(reductions))
  const reduction = Math.min(0.9, Math.max(0, params.damageTakenReduction ?? 0));
  const damageTakenMod = 1.0 - reduction;

  // Boss 10% resistance
  const bossResistanceMod = params.isBossOrMiniBoss ? (1.0 - BALANCE_CONFIG.boss.resistance) : 1.0;

  const unrounded =
    baseDamage *
    attackMod *
    terrainMod *
    elementMod *
    critMod *
    skillMod *
    synergyMod *
    defenseMod *
    damageTakenMod *
    bossResistanceMod;

  // Minimum damage is 1 (if attack hits target)
  const finalMitigatedDamage = Math.max(BALANCE_CONFIG.globalCaps.minimumDamage, roundHalfUp(unrounded));

  return {
    rawDamage: baseDamage * attackMod * terrainMod * skillMod * synergyMod,
    elementModifier: elementMod,
    critModifier: critMod,
    defenseModifier: defenseMod,
    damageTakenModifier: damageTakenMod,
    bossResistanceModifier: bossResistanceMod,
    finalMitigatedDamage,
  };
}

/**
 * Calculate Attack Speed after additive buffs and global capping.
 * Capped between attackSpeedMin (0.25) and attackSpeedMax (5.0).
 */
export function calculateEffectiveAttackSpeed(
  baseAS: number,
  buffs: Array<{ percent: number }>,
  debuffs: Array<{ percent: number }>
): number {
  const buffSum = buffs.reduce((acc, b) => acc + b.percent, 0);
  const debuffSum = debuffs.reduce((acc, d) => acc + d.percent, 0);
  const totalMultiplier = Math.max(0.1, 1.0 + buffSum - debuffSum);

  const effective = baseAS * totalMultiplier;
  return Math.min(
    BALANCE_CONFIG.globalCaps.attackSpeedMax,
    Math.max(BALANCE_CONFIG.globalCaps.attackSpeedMin, effective)
  );
}

/**
 * PRD PC-07 & B9: Global Boss CC Calculator
 * FinalDuration = min(BaseDuration * 0.50, BossCCCap)
 */
export function calculateCCDuration(
  baseDuration: number,
  isBoss: boolean,
  ccType: 'stun' | 'root' | 'slow'
): number {
  if (!isBoss) {
    if (ccType === 'stun') return Math.min(BALANCE_CONFIG.globalCaps.normalStunMax, baseDuration);
    if (ccType === 'root') return Math.min(BALANCE_CONFIG.statusEffects.root.maxNormalDuration, baseDuration);
    return baseDuration;
  }

  const halved = baseDuration * BALANCE_CONFIG.statusEffects.bossCC.durationMultiplier;
  if (ccType === 'stun') {
    return Math.min(BALANCE_CONFIG.statusEffects.bossCC.stunCap, halved);
  }
  if (ccType === 'root') {
    return Math.min(BALANCE_CONFIG.statusEffects.bossCC.rootCap, halved);
  }
  return halved;
}

/**
 * PRD B7: Pull displacement calculator
 * Capped at 3.0 tiles cumulative per effect instance.
 * For boss: 50% displacement cap (1.5 tiles).
 */
export function calculatePullDisplacement(
  intendedPull: number,
  accumulatedPull: number,
  isBoss: boolean
): number {
  const maxCap = isBoss
    ? BALANCE_CONFIG.statusEffects.bossCC.pullCap
    : BALANCE_CONFIG.globalCaps.pullMaxPerEffect;

  const remaining = Math.max(0, maxCap - accumulatedPull);
  return Math.min(intendedPull, remaining);
}

/**
 * PRD PC-02 & B5: Elite Reward Calculator
 * EliteReward = RoundHalfUp(NormalReward * 2.5)
 */
export function calculateEliteReward(baseReward: number): number {
  return roundHalfUp(baseReward * BALANCE_CONFIG.economy.eliteRewardMultiplier);
}

/**
 * PRD C4: Crit stats by Rarity
 */
export function getCritStats(rarity: Rarity): { chance: number; damage: number } {
  const config = BALANCE_CONFIG.heroUltimates.crit[rarity];
  return {
    chance: Math.min(BALANCE_CONFIG.globalCaps.critChanceMax, config.chance),
    damage: Math.min(
      BALANCE_CONFIG.globalCaps.critDamageMax,
      Math.max(BALANCE_CONFIG.globalCaps.critDamageMin, config.damage)
    ),
  };
}

/**
 * PRD C6: Level multiplier for hero stats (ATK, HP, DEF)
 */
export function getHeroLevelMultiplier(level: number): number {
  const idx = Math.max(1, Math.min(10, Math.floor(level))) - 1;
  return BALANCE_CONFIG.heroStats.levelMultipliers.values[idx];
}
