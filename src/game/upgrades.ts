import type { Upgrade } from '@/types/game';

/**
 * Purchasable upgrades, defined purely as data. Each one permanently multiplies
 * a building's production speed (see `Upgrade` and `computeBuildingSpeed`).
 *
 * Currently a single test upgrade; add entries here to grow the Upgrades shop.
 */
export const UPGRADES: Upgrade[] = [
  {
    id: 'tidePoolSpeed2',
    name: 'Tide Pool ×2 Speed',
    targetBuildingId: 'tidePoolCollector',
    speedMultiplier: 2,
    costs: [{ resource: 'driftwood', amount: 1000 }],
  },
];

/** Ownership map for upgrades, keyed by upgrade id (true = purchased). */
export type UpgradeState = Record<string, boolean>;

/**
 * Combined speed factor for a building: the product of every owned upgrade that
 * targets it (1 when none are owned). Speed factors stack multiplicatively.
 */
export function computeBuildingSpeed(buildingId: string, owned: UpgradeState): number {
  let speed = 1;
  for (const upgrade of UPGRADES) {
    if (upgrade.targetBuildingId === buildingId && owned[upgrade.id]) {
      speed *= upgrade.speedMultiplier;
    }
  }
  return speed;
}
