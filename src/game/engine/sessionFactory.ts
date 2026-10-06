/**
 * Elemental Wildguard - Battle Session Factory
 * Enforces strict separation between Permanent Progression and Temporary Battle State.
 *
 * Rules:
 * 1. Every level/stage, retry, and rematch creates a completely new battle session.
 * 2. No runtime battlefield state (towers, tower levels, gold, wave, buffs, enemies) is ever carried over.
 * 3. Max-level towers never carry over across levels or retries.
 */

import { GameSimulation } from './gameSimulation';
import { CAMPAIGN_LEVELS } from '../data/levelRegistry';
import { GameMode, PlayerRole } from '../types/gameTypes';

/**
 * Creates a pristine, completely isolated match session for the specified level and mode.
 * All temporary states are initialized strictly from BalanceConfig/CAMPAIGN_LEVELS.
 */
export function createNewGameSession(
  levelId: number = 1,
  playerMode: GameMode = 'single',
  activePlayer: PlayerRole = 'P1'
): GameSimulation {
  const validLevel = Math.max(1, Math.min(5, levelId));
  const sim = new GameSimulation(BigInt(Date.now()));
  sim.initFreshSession(validLevel, playerMode, activePlayer);
  return sim;
}
