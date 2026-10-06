/**
 * Elemental Wildguard - Synergy System Engine
 * PRD v2.2 Section A7 & BalanceConfig compliant.
 * Handles 2-Element, 3-Element, 4-Element Awakening, and Elemental Burst with 10s contribution tracking.
 */

import { BALANCE_CONFIG } from '../config/balanceConfig';
import { Element, EnemyInstance, HeroInstance } from '../types/gameTypes';
import { roundHalfUp } from './combatFormulas';

export interface SynergyTriggerResult {
  synergyName: string;
  elements: Element[];
  damage: number;
  message: string;
  effectType?: 'burn' | 'slow' | 'root' | 'pull' | 'stun';
  effectValue?: any;
}

export class SynergyManager {
  private lastSynergyTriggerTick: Record<string, number> = {};
  private elementalBurstCooldownTimer: number = 0; // In seconds
  // 10-second contribution tracking window: records element damage entries with timestamp
  private recentContributions: Array<{ element: Element; damage: number; timestamp: number }> = [];

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.lastSynergyTriggerTick = {};
    this.elementalBurstCooldownTimer = 0;
    this.recentContributions = [];
  }

  /**
   * Records damage generated for an element in the 10-second contribution sliding window.
   */
  public recordContribution(element: Element, preMitigationDamage: number, currentTimestamp: number): void {
    this.recentContributions.push({
      element,
      damage: preMitigationDamage,
      timestamp: currentTimestamp,
    });
    this.pruneOldContributions(currentTimestamp);
  }

  /**
   * Records synergy damage split equally across participating elements (PRD A7).
   */
  public recordSynergySplitContribution(elements: Element[], totalDamage: number, currentTimestamp: number): void {
    if (elements.length === 0) return;
    const splitDamage = totalDamage / elements.length;
    for (const el of elements) {
      this.recordContribution(el, splitDamage, currentTimestamp);
    }
  }

  private pruneOldContributions(currentTimestamp: number): void {
    const windowSec = BALANCE_CONFIG.synergy.recentContributionWindow;
    const cutoff = currentTimestamp - windowSec;
    this.recentContributions = this.recentContributions.filter((c) => c.timestamp >= cutoff);
  }

  /**
   * Returns total damage per element in the last 10 seconds.
   */
  public getContributionsLast10s(currentTimestamp: number): Record<Element, number> {
    this.pruneOldContributions(currentTimestamp);
    const totals: Record<Element, number> = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Wind: 0,
    };
    for (const c of this.recentContributions) {
      totals[c.element] += c.damage;
    }
    return totals;
  }

  /**
   * Identifies which element has the lowest contribution in the last 10s.
   * Tie-break order: Fire -> Water -> Earth -> Wind.
   */
  public getLowestContributionElement(currentTimestamp: number): Element {
    const totals = this.getContributionsLast10s(currentTimestamp);
    const tieOrder = BALANCE_CONFIG.synergy.elementTieOrder; // ['Fire', 'Water', 'Earth', 'Wind']

    let minElement: Element = tieOrder[0];
    let minDamage = totals[minElement];

    for (const el of tieOrder) {
      if (totals[el] < minDamage) {
        minDamage = totals[el];
        minElement = el;
      }
    }
    return minElement;
  }

  /**
   * Calculates CombinedAverageATK for given elements among active alive heroes (PRD A7).
   */
  public calculateCombinedAverageATK(activeHeroes: HeroInstance[], requiredElements: Element[]): number {
    const participating = activeHeroes.filter(
      (h) => !h.isDead && requiredElements.includes(h.element)
    );
    if (participating.length === 0) return 0;
    const sum = participating.reduce((acc, h) => acc + h.effectiveATK, 0);
    return sum / participating.length;
  }

  /**
   * Checks if team has at least one active alive hero for each requested element.
   */
  public hasActiveElements(activeHeroes: HeroInstance[], elements: Element[]): boolean {
    const aliveElements = new Set(activeHeroes.filter((h) => !h.isDead).map((h) => h.element));
    return elements.every((el) => aliveElements.has(el));
  }

  /**
   * Checks whether 4-Element Awakening is active (PRD A7).
   * Requires 1 Fire, 1 Water, 1 Earth, 1 Wind all alive.
   */
  public isFourElementAwakeningActive(activeHeroes: HeroInstance[]): boolean {
    return this.hasActiveElements(activeHeroes, ['Fire', 'Water', 'Earth', 'Wind']);
  }

  /**
   * Evaluates synergy trigger on an enemy event.
   * Checks 3-element synergies first, then 2-element synergies.
   * ICD: 2.0s per synergy type.
   */
  public checkSynergyTrigger(
    enemy: EnemyInstance,
    attackingElement: Element,
    activeHeroes: HeroInstance[],
    currentTick: number,
    fps: number = 60
  ): SynergyTriggerResult | null {
    const icdInTicks = BALANCE_CONFIG.synergy.synergyICD * fps;

    const canTrigger = (name: string): boolean => {
      const last = this.lastSynergyTriggerTick[name] ?? -999999;
      return currentTick - last >= icdInTicks;
    };

    const hasBurn = enemy.statuses.burns.length > 0;
    const hasSlow = (enemy.statuses.slow?.percent ?? 0) > 0;
    const hasEarthMark = (enemy.statuses.earthMarkDuration ?? 0) > 0;

    // --- 3-ELEMENT SYNERGIES ---
    // 1. Typhoon Flame: Burn + Slow + Wind damage event
    if (
      hasBurn &&
      hasSlow &&
      attackingElement === 'Wind' &&
      this.hasActiveElements(activeHeroes, ['Fire', 'Water', 'Wind']) &&
      canTrigger('Typhoon Flame')
    ) {
      this.lastSynergyTriggerTick['Typhoon Flame'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Fire', 'Water', 'Wind']);
      const dmg = roundHalfUp(avgATK * 3.5);
      return {
        synergyName: 'Typhoon Flame',
        elements: ['Fire', 'Water', 'Wind'],
        damage: dmg,
        message: `Typhoon Flame triggered! Searing gale detonates for ${dmg} damage.`,
      };
    }

    // 2. Volcanic Spring: Burn + Slow + Earth Mark
    if (
      hasBurn &&
      hasSlow &&
      hasEarthMark &&
      this.hasActiveElements(activeHeroes, ['Fire', 'Water', 'Earth']) &&
      canTrigger('Volcanic Spring')
    ) {
      this.lastSynergyTriggerTick['Volcanic Spring'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Fire', 'Water', 'Earth']);
      const dmg = roundHalfUp(avgATK * 3.8);
      return {
        synergyName: 'Volcanic Spring',
        elements: ['Fire', 'Water', 'Earth'],
        damage: dmg,
        message: `Volcanic Spring erupted! Geothermal blast deals ${dmg} damage.`,
      };
    }

    // 3. Inferno Storm: Burn + Earth Mark + Wind damage event
    if (
      hasBurn &&
      hasEarthMark &&
      attackingElement === 'Wind' &&
      this.hasActiveElements(activeHeroes, ['Fire', 'Earth', 'Wind']) &&
      canTrigger('Inferno Storm')
    ) {
      this.lastSynergyTriggerTick['Inferno Storm'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Fire', 'Earth', 'Wind']);
      const dmg = roundHalfUp(avgATK * 4.0);
      return {
        synergyName: 'Inferno Storm',
        elements: ['Fire', 'Earth', 'Wind'],
        damage: dmg,
        message: `Inferno Storm summoned! Fiery tempest sweeps battlefield for ${dmg} damage.`,
      };
    }

    // 4. Primal Monsoon: Slow + Earth Mark + Wind damage event
    if (
      hasSlow &&
      hasEarthMark &&
      attackingElement === 'Wind' &&
      this.hasActiveElements(activeHeroes, ['Water', 'Earth', 'Wind']) &&
      canTrigger('Primal Monsoon')
    ) {
      this.lastSynergyTriggerTick['Primal Monsoon'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Water', 'Earth', 'Wind']);
      const dmg = roundHalfUp(avgATK * 3.6);
      return {
        synergyName: 'Primal Monsoon',
        elements: ['Water', 'Earth', 'Wind'],
        damage: dmg,
        message: `Primal Monsoon overwhelmed enemy! Tectonic storm deals ${dmg} damage.`,
      };
    }

    // --- 2-ELEMENT REACTIONS (PRD v3.0 Section 23) ---
    // 5. Steam Burst (Fire + Water): Burn + Slow
    if (
      hasBurn &&
      hasSlow &&
      this.hasActiveElements(activeHeroes, ['Fire', 'Water']) &&
      (canTrigger('Steam Burst') || canTrigger('Steamfall'))
    ) {
      this.lastSynergyTriggerTick['Steam Burst'] = currentTick;
      this.lastSynergyTriggerTick['Steamfall'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Fire', 'Water']);
      const dmg = roundHalfUp(avgATK * 2.5);
      return {
        synergyName: 'Steam Burst',
        elements: ['Fire', 'Water'],
        damage: dmg,
        message: `Steam Burst vapor shockwave dealt ${dmg} damage & reduced accuracy!`,
      };
    }

    // 6. Magma Core (Fire + Earth): Burn + Earth Mark
    if (
      hasBurn &&
      hasEarthMark &&
      this.hasActiveElements(activeHeroes, ['Fire', 'Earth']) &&
      canTrigger('Magma Core')
    ) {
      this.lastSynergyTriggerTick['Magma Core'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Fire', 'Earth']);
      const dmg = roundHalfUp(avgATK * 3.0);
      return {
        synergyName: 'Magma Core',
        elements: ['Fire', 'Earth'],
        damage: dmg,
        message: `Magma Core exploded for ${dmg} damage!`,
      };
    }

    // 7. Flame Surge (Fire + Wind): Burn + Wind attack (PRD v3.0 Section 23)
    if (
      hasBurn &&
      attackingElement === 'Wind' &&
      this.hasActiveElements(activeHeroes, ['Fire', 'Wind']) &&
      (canTrigger('Flame Surge') || canTrigger('Firestorm'))
    ) {
      this.lastSynergyTriggerTick['Flame Surge'] = currentTick;
      this.lastSynergyTriggerTick['Firestorm'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Fire', 'Wind']);
      const dmg = roundHalfUp(avgATK * 2.8);
      return {
        synergyName: 'Flame Surge',
        elements: ['Fire', 'Wind'],
        damage: dmg,
        effectType: 'burn',
        effectValue: 2.0,
        message: `Flame Surge erupted! Area wildfire deals ${dmg} damage & extends burn!`,
      };
    }

    // 8. Mud Bind (Water + Earth): Slow + Earth Mark (PRD v3.0 Section 23)
    if (
      hasSlow &&
      hasEarthMark &&
      this.hasActiveElements(activeHeroes, ['Water', 'Earth']) &&
      (canTrigger('Mud Bind') || canTrigger('Mud Prison'))
    ) {
      this.lastSynergyTriggerTick['Mud Bind'] = currentTick;
      this.lastSynergyTriggerTick['Mud Prison'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Water', 'Earth']);
      const dmg = roundHalfUp(avgATK * 2.2);
      return {
        synergyName: 'Mud Bind',
        elements: ['Water', 'Earth'],
        damage: dmg,
        effectType: 'root',
        effectValue: 2.5,
        message: `Mud Bind encases target! ${dmg} damage and Rooted for 2.5s.`,
      };
    }

    // 9. Ice Gale (Water + Wind): Slow + Wind attack
    if (
      hasSlow &&
      attackingElement === 'Wind' &&
      this.hasActiveElements(activeHeroes, ['Water', 'Wind']) &&
      canTrigger('Ice Gale')
    ) {
      this.lastSynergyTriggerTick['Ice Gale'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Water', 'Wind']);
      const dmg = roundHalfUp(avgATK * 2.4);
      return {
        synergyName: 'Ice Gale',
        elements: ['Water', 'Wind'],
        damage: dmg,
        effectType: 'slow',
        effectValue: 0.60,
        message: `Ice Gale chilled enemy! ${dmg} damage and intensified 60% slow.`,
      };
    }

    // 10. Dust Storm (Earth + Wind): Earth Mark + Wind attack (PRD v3.0 Section 23)
    if (
      hasEarthMark &&
      attackingElement === 'Wind' &&
      this.hasActiveElements(activeHeroes, ['Earth', 'Wind']) &&
      (canTrigger('Dust Storm') || canTrigger('Dust Tempest'))
    ) {
      this.lastSynergyTriggerTick['Dust Storm'] = currentTick;
      this.lastSynergyTriggerTick['Dust Tempest'] = currentTick;
      const avgATK = this.calculateCombinedAverageATK(activeHeroes, ['Earth', 'Wind']);
      const dmg = roundHalfUp(avgATK * 2.6);
      return {
        synergyName: 'Dust Storm',
        elements: ['Earth', 'Wind'],
        damage: dmg,
        effectType: 'pull',
        effectValue: 1.5,
        message: `Dust Storm blinds and slows targets! ${dmg} damage and displaced 1.5 tiles.`,
      };
    }

    return null;
  }

  public updateBurstCooldown(dt: number): void {
    if (this.elementalBurstCooldownTimer > 0) {
      this.elementalBurstCooldownTimer = Math.max(0, this.elementalBurstCooldownTimer - dt);
    }
  }

  public isBurstReady(): boolean {
    return this.elementalBurstCooldownTimer <= 0;
  }

  public getBurstCooldownRemaining(): number {
    return this.elementalBurstCooldownTimer;
  }

  public triggerBurstCooldown(): void {
    this.elementalBurstCooldownTimer = BALANCE_CONFIG.synergy.elementalBurst.cooldown; // 30s
  }
}
