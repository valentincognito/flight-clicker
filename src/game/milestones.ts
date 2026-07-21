import { BUILDINGS } from '@/game/buildings';

/** A celebratory unlock, keyed to a building reaching a given owned count. */
export interface Milestone {
  buildingId: string;
  /** Owned count at which this milestone fires. */
  threshold: number;
  title: string;
  message: string;
}

/**
 * Owned-count thresholds that trigger a celebration for every building.
 *
 * This is purely presentational data — it drives the milestone overlay only and
 * has NO effect on the economy, tick loop, or purchase rules (which live in
 * gameStore.ts / buildings.ts and are untouched by this phase).
 */
const THRESHOLDS = [1, 5, 10, 25, 50];

export const MILESTONES: Milestone[] = BUILDINGS.flatMap((building) =>
  THRESHOLDS.map((threshold) => ({
    buildingId: building.id,
    threshold,
    title: threshold === 1 ? `${building.name} unlocked` : `${building.name} ×${threshold}`,
    message:
      threshold === 1
        ? `Your first ${building.name} joins the cove.`
        : `${threshold} ${building.name}s now work the shore.`,
  })),
);

/**
 * The milestone crossed when `buildingId` moves from `prevOwned` to `nextOwned`,
 * or `null` if none was crossed.
 */
export function crossedMilestone(
  buildingId: string,
  prevOwned: number,
  nextOwned: number,
): Milestone | null {
  return (
    MILESTONES.find(
      (m) => m.buildingId === buildingId && m.threshold > prevOwned && m.threshold <= nextOwned,
    ) ?? null
  );
}
