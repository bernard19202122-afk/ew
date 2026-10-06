/**
 * Elemental Wildguard - Grid, Lanes, Hero Slots, and Path Reachability Validation
 * PRD v2.2 Section C5 compliant.
 */

import { Element, GridPoint, TacticalSlot } from '../types/gameTypes';

export const GRID_WIDTH = 12;
export const GRID_HEIGHT = 8;

export const BASE_TILES: GridPoint[] = [
  { x: 11, y: 3 },
  { x: 11, y: 4 },
];

export const SPAWN_TILES: GridPoint[] = [
  { x: 0, y: 1 }, // Lane 0 spawn
  { x: 0, y: 6 }, // Lane 1 spawn
];

// Pre-defined lane paths for predictable, deterministic enemy movement
export const LANE_0_PATH: GridPoint[] = [
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
  { x: 4, y: 1 },
  { x: 5, y: 2 },
  { x: 6, y: 2 },
  { x: 7, y: 2 },
  { x: 8, y: 3 },
  { x: 9, y: 3 },
  { x: 10, y: 3 },
  { x: 11, y: 3 }, // Base
];

export const LANE_1_PATH: GridPoint[] = [
  { x: 0, y: 6 },
  { x: 1, y: 6 },
  { x: 2, y: 6 },
  { x: 3, y: 6 },
  { x: 4, y: 6 },
  { x: 5, y: 5 },
  { x: 6, y: 5 },
  { x: 7, y: 5 },
  { x: 8, y: 4 },
  { x: 9, y: 4 },
  { x: 10, y: 4 },
  { x: 11, y: 4 }, // Base
];

export const LANE_PATHS = [LANE_0_PATH, LANE_1_PATH];

// 12 Valid Tactical Hero Placement Slots with Terrain Elemental Affinities
export const TACTICAL_HERO_SLOTS: TacticalSlot[] = [
  { slotIndex: 0, tileX: 2, tileY: 0, terrainBonus: 'Fire' },
  { slotIndex: 1, tileX: 4, tileY: 0, terrainBonus: 'Wind' },
  { slotIndex: 2, tileX: 6, tileY: 1, terrainBonus: 'Water' },
  { slotIndex: 3, tileX: 3, tileY: 3, terrainBonus: 'Earth' },
  { slotIndex: 4, tileX: 5, tileY: 3, terrainBonus: 'Earth' },
  { slotIndex: 5, tileX: 7, tileY: 3, terrainBonus: 'Fire' },
  { slotIndex: 6, tileX: 3, tileY: 4, terrainBonus: 'Water' },
  { slotIndex: 7, tileX: 5, tileY: 4, terrainBonus: 'Wind' },
  { slotIndex: 8, tileX: 7, tileY: 4, terrainBonus: 'Earth' },
  { slotIndex: 9, tileX: 6, tileY: 6, terrainBonus: 'Water' },
  { slotIndex: 10, tileX: 2, tileY: 7, terrainBonus: 'Fire' },
  { slotIndex: 11, tileX: 4, tileY: 7, terrainBonus: 'Wind' },
];

/**
 * Checks if a given tile is part of any active lane path.
 */
export function isPathTile(x: number, y: number): boolean {
  for (const path of LANE_PATHS) {
    if (path.some((pt) => pt.x === x && pt.y === y)) return true;
  }
  return false;
}

/**
 * Checks if a tile is a Base tile.
 */
export function isBaseTile(x: number, y: number): boolean {
  return BASE_TILES.some((b) => b.x === x && b.y === y);
}

/**
 * Distance metric between two grid points (Euclidean).
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * PRD C5 Earth Wall Path Validation
 * Clones grid reachability graph, injects candidate wall, and runs BFS reachability check.
 * Ensures:
 * 1. Every spawn node has at least one valid route to Base.
 * 2. Every currently active enemy position has a route to Base.
 * If any route is completely blocked, returns false.
 */
export function validateEarthWallPlacement(
  wallX: number,
  wallY: number,
  activeWalls: Array<{ tileX: number; tileY: number }>,
  activeEnemyPositions: GridPoint[]
): boolean {
  // Candidate wall cannot be on Base tile
  if (isBaseTile(wallX, wallY)) return false;

  // Cannot place on an existing wall
  if (activeWalls.some((w) => w.tileX === wallX && w.tileY === wallY)) return false;

  const blocked = new Set<string>();
  for (const w of activeWalls) {
    blocked.add(`${w.tileX},${w.tileY}`);
  }
  blocked.add(`${wallX},${wallY}`);

  // Helper BFS reachability check to Base
  const canReachBase = (start: GridPoint): boolean => {
    const queue: GridPoint[] = [{ x: Math.round(start.x), y: Math.round(start.y) }];
    const visited = new Set<string>();
    visited.add(`${queue[0].x},${queue[0].y}`);

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (isBaseTile(curr.x, curr.y)) return true;

      for (const d of dirs) {
        const nx = curr.x + d.dx;
        const ny = curr.y + d.dy;
        const key = `${nx},${ny}`;

        if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
          if (!blocked.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }
    return false;
  };

  // Check all spawns
  for (const spawn of SPAWN_TILES) {
    if (!canReachBase(spawn)) return false;
  }

  // Check all active enemies
  for (const enemyPos of activeEnemyPositions) {
    if (!canReachBase(enemyPos)) return false;
  }

  return true;
}
