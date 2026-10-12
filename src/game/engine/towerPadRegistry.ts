/**
 * Elemental Wildguard - Tower Pad Single Source of Truth Model & Placement Registry
 * Compliant with Master PRD - Tower Pad & Deploy System Fix v1.0
 *
 * Requirements:
 * 1. Every tower pad has a unique ID and world-space position.
 * 2. Deploy interaction strictly references pad ID.
 * 3. One pad = exactly one deploy interaction.
 * 4. Empty pad displays +DEPLOY marker; occupied pad hides it.
 * 5. Screen position derived dynamically via worldToScreen projection, surviving resize & zoom.
 * 6. Center alignment target error 0-5px (< 15px valid).
 * 7. Deploy zones never overlap enemy paths.
 * 8. Automatic position validation function validateTowerPadAlignment().
 */

import { Element } from '../types/gameTypes';
import { GRID_WIDTH, GRID_HEIGHT, LANE_PATHS } from './pathfinding';

export interface TowerPad {
  id: string;
  slotIndex: number;
  worldX: number; // Grid world coordinate X (0..GRID_WIDTH-1)
  worldY: number; // Grid world coordinate Y (0..GRID_HEIGHT-1)
  element: Element;
  occupied: boolean;
  towerId: string | null;
}

/**
 * Explicit official tower pads definition (Single Source of Truth)
 * Coordinates verified to NOT overlap enemy lane paths.
 */
export const OFFICIAL_TOWER_PADS: readonly Omit<TowerPad, 'occupied' | 'towerId'>[] = [
  { id: 'PAD_01', slotIndex: 0, worldX: 2, worldY: 0, element: 'Fire' },
  { id: 'PAD_02', slotIndex: 1, worldX: 4, worldY: 0, element: 'Wind' },
  { id: 'PAD_03', slotIndex: 2, worldX: 6, worldY: 1, element: 'Water' },
  { id: 'PAD_04', slotIndex: 3, worldX: 3, worldY: 3, element: 'Earth' },
  { id: 'PAD_05', slotIndex: 4, worldX: 5, worldY: 3, element: 'Earth' },
  { id: 'PAD_06', slotIndex: 5, worldX: 7, worldY: 3, element: 'Fire' },
  { id: 'PAD_07', slotIndex: 6, worldX: 3, worldY: 4, element: 'Water' },
  { id: 'PAD_08', slotIndex: 7, worldX: 5, worldY: 4, element: 'Wind' },
  { id: 'PAD_09', slotIndex: 8, worldX: 7, worldY: 4, element: 'Earth' },
  { id: 'PAD_10', slotIndex: 9, worldX: 6, worldY: 6, element: 'Water' },
  { id: 'PAD_11', slotIndex: 10, worldX: 2, worldY: 7, element: 'Fire' },
  { id: 'PAD_12', slotIndex: 11, worldX: 4, worldY: 7, element: 'Wind' },
] as const;

/**
 * Projects a TowerPad world position (grid space) into container screen coordinates (pixels).
 * Center anchor alignment: the returned position is the exact geometric center of the pad.
 */
export function projectWorldToScreen(
  worldX: number,
  worldY: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  // Pad center in grid coordinates is worldX + 0.5, worldY + 0.5
  const normalizedX = (worldX + 0.5) / GRID_WIDTH;
  const normalizedY = (worldY + 0.5) / GRID_HEIGHT;
  return {
    x: normalizedX * containerWidth,
    y: normalizedY * containerHeight,
  };
}

/**
 * Calculates percentage-based center anchor position for resolution & zoom independence.
 */
export function projectWorldToScreenPct(
  worldX: number,
  worldY: number
): { leftPct: number; topPct: number } {
  return {
    leftPct: ((worldX + 0.5) / GRID_WIDTH) * 100,
    topPct: ((worldY + 0.5) / GRID_HEIGHT) * 100,
  };
}

/**
 * Validates that no tower pads overlap any enemy paths.
 * Enforces PRD Requirement: "deploy zones must not overlap enemy paths".
 */
export function validateTowerPadsNoPathOverlap(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  OFFICIAL_TOWER_PADS.forEach((pad) => {
    for (let laneIdx = 0; laneIdx < LANE_PATHS.length; laneIdx++) {
      const path = LANE_PATHS[laneIdx];
      const collision = path.some((pt) => pt.x === pad.worldX && pt.y === pad.worldY);
      if (collision) {
        errors.push(`ERROR: Pad ${pad.id} at (${pad.worldX},${pad.worldY}) collides with Lane ${laneIdx} path!`);
      }
    }
  });
  return { valid: errors.length === 0, errors };
}

/**
 * Validates deploy marker alignment against pad center.
 * PRD Requirement 17: Distance between deploy center and pad center must be < 15px.
 */
export function validateTowerPadAlignment(
  deployCenter: { x: number; y: number },
  padCenter: { x: number; y: number }
): { aligned: boolean; distance: number; error?: string } {
  const dx = deployCenter.x - padCenter.x;
  const dy = deployCenter.y - padCenter.y;
  const distance = Math.hypot(dx, dy);
  const aligned = distance <= 15;
  return {
    aligned,
    distance,
    error: aligned ? undefined : `ALIGNMENT_ERROR: Deploy marker distance ${distance.toFixed(2)}px exceeds 15px threshold.`,
  };
}
