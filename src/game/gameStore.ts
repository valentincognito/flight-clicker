import { create } from "zustand";

import { BUILDINGS, buildingCost } from "@/game/buildings";
import type { CurrencyId, OfflineReport, ResourceState } from "@/types/game";

/** The resource the player gathers by tapping, and that seeds the economy. */
export const PRIMARY_CURRENCY: CurrencyId = "driftwood";

/** How much the primary resource increases per manual tap. */
export const TAP_AMOUNT = 1;

/**
 * How often the economy advances, in milliseconds. Small so production-cycle
 * progress bars animate smoothly; each `tick()` advances progress by this much.
 */
export const TICK_MS = 100;
const TICK_SECONDS = TICK_MS / 1000;

/** Cycle length used if a producing building somehow omits `cycleTime`. */
const DEFAULT_CYCLE = 1;

/** Owned count per building, keyed by building id. */
type OwnedState = Record<string, number>;

/** Elapsed seconds in the current production cycle, keyed by building id. */
type ProgressState = Record<string, number>;

interface GameState {
  /** Current amount held of every currency. */
  resources: ResourceState;
  /** How many of each building the player owns. */
  owned: OwnedState;
  /**
   * Seconds elapsed in each building's current production cycle. Reaches the
   * building's `cycleTime`, pays out, and resets. This drives payout *timing*;
   * the shop's progress bars are a decoupled UI-thread animation of the same
   * cadence, so they never read this directly.
   */
  progress: ProgressState;
  /** Set once the finale building (Grand Beacon) is purchased. */
  flightComplete: boolean;
  /**
   * False until a saved game has been loaded (or confirmed absent). The tick
   * loop and autosave wait for this so we never overwrite a real save with the
   * initial default state on startup.
   */
  hydrated: boolean;
  /** What accrued while the app was closed, for a "welcome back" message. */
  offlineReport: OfflineReport | null;
  /** Advance the economy by one tick (`TICK_MS` of production). */
  tick: () => void;
  /** Replace state from a loaded save (with offline gains already applied). */
  hydrate: (loaded: {
    resources: ResourceState;
    owned: OwnedState;
    progress: ProgressState;
    flightComplete: boolean;
    offlineReport: OfflineReport | null;
  }) => void;
  /** Mark startup complete when there was no save to load (fresh game). */
  markHydrated: () => void;
  /** Clear the offline report once the UI has shown it. */
  dismissOfflineReport: () => void;
  /** Buy one unit of `id` if affordable, deducting its cost. Returns success. */
  buyBuilding: (id: string) => boolean;
  /** Manual tap: bump the primary resource by `TAP_AMOUNT`. */
  tapBoost: () => void;
  /**
   * Whether `resource` should be shown/ticked yet. Driftwood is always
   * unlocked; seaGlass and starlight stay locked until at least one building
   * producing them has been purchased. The UI uses this to hide locked chips.
   */
  isResourceUnlocked: (resource: CurrencyId) => boolean;
  /**
   * Current global production multiplier (1 + bonuses from multiplier
   * buildings). Exposed so the shop can show each building's effective,
   * multiplier-adjusted output in real time.
   */
  productionMultiplier: () => number;
  /** True if `id`'s first purchase should trigger a milestone celebration. */
  isMilestoneBuilding: (id: string) => boolean;
  /** True if `id` is the finale building that triggers flight-complete. */
  isFinaleBuilding: (id: string) => boolean;
}

function initialResources(): ResourceState {
  return { driftwood: 0, seaGlass: 0, starlight: 0 };
}

function initialOwned(): OwnedState {
  return Object.fromEntries(BUILDINGS.map((building) => [building.id, 0]));
}

function initialProgress(): ProgressState {
  return Object.fromEntries(BUILDINGS.map((building) => [building.id, 0]));
}

/**
 * Global production multiplier from all owned multiplier buildings: `1` plus the
 * sum of each multiplier building's `multiplierBonus * ownedCount`. Exported so
 * the offline-accumulation math can reuse it against a loaded save's `owned`.
 */
export function globalMultiplier(owned: OwnedState): number {
  let bonus = 0;
  for (const building of BUILDINGS) {
    if (building.isMultiplier) {
      bonus += (owned[building.id] ?? 0) * (building.multiplierBonus ?? 0);
    }
  }
  return 1 + bonus;
}

export const useGameStore = create<GameState>()((set, get) => ({
  resources: initialResources(),
  owned: initialOwned(),
  progress: initialProgress(),
  flightComplete: false,
  hydrated: false,
  offlineReport: null,

  tick: () =>
    set((state) => {
      const multiplier = globalMultiplier(state.owned);
      // Keep the previous references and only clone the slices that actually
      // change: `resources` only when a payout lands (so `resources` selectors
      // don't re-render every tick), `progress` only when a producer advances.
      let resources = state.resources;
      let progress = state.progress;
      let resourcesChanged = false;
      let progressChanged = false;

      for (const building of BUILDINGS) {
        if (building.producesResource === null) continue;
        const count = state.owned[building.id] ?? 0;
        // A resource only accumulates once at least one of its producers is
        // owned — which is exactly the `isResourceUnlocked` condition, so
        // locked resources naturally stay at zero (and idle bars don't fill).
        if (count <= 0) continue;

        const cycle = building.cycleTime ?? DEFAULT_CYCLE;
        let elapsed = (state.progress[building.id] ?? 0) + TICK_SECONDS;
        // Pay out `rate * cycleTime` per completed cycle. The loop handles the
        // rare case of a long frame spanning more than one cycle; the average
        // rate stays `count * productionRate * multiplier` per second.
        let payout = 0;
        while (elapsed >= cycle) {
          elapsed -= cycle;
          payout += count * building.productionRate * cycle * multiplier;
        }

        if (payout > 0) {
          if (!resourcesChanged) {
            resources = { ...resources };
            resourcesChanged = true;
          }
          resources[building.producesResource] += payout;
        }

        if (!progressChanged) {
          progress = { ...progress };
          progressChanged = true;
        }
        progress[building.id] = elapsed;
      }

      if (!resourcesChanged && !progressChanged) return {};
      if (!resourcesChanged) return { progress };
      if (!progressChanged) return { resources };
      return { resources, progress };
    }),

  buyBuilding: (id) => {
    const { resources, owned } = get();
    const building = BUILDINGS.find((b) => b.id === id);
    if (!building) return false;

    const count = owned[id] ?? 0;
    const costs = buildingCost(building, count);

    // A purchase can require several resources at once; all must be affordable.
    if (costs.some((cost) => resources[cost.resource] < cost.amount))
      return false;

    const nextResources = { ...resources };
    for (const cost of costs) {
      nextResources[cost.resource] -= cost.amount;
    }

    set({
      resources: nextResources,
      owned: { ...owned, [id]: count + 1 },
      ...(building.isFinale ? { flightComplete: true } : null),
    });
    return true;
  },

  tapBoost: () =>
    set((state) => ({
      resources: {
        ...state.resources,
        [PRIMARY_CURRENCY]: state.resources[PRIMARY_CURRENCY] + TAP_AMOUNT,
      },
    })),

  hydrate: (loaded) =>
    // Merge onto fresh defaults so a save written before a building/resource
    // existed still loads cleanly (missing keys fall back to their initial 0).
    set({
      resources: { ...initialResources(), ...loaded.resources },
      owned: { ...initialOwned(), ...loaded.owned },
      progress: { ...initialProgress(), ...loaded.progress },
      flightComplete: loaded.flightComplete,
      offlineReport: loaded.offlineReport,
      hydrated: true,
    }),

  markHydrated: () => set({ hydrated: true }),

  dismissOfflineReport: () => set({ offlineReport: null }),

  isResourceUnlocked: (resource) => {
    if (resource === PRIMARY_CURRENCY) return true;
    const { owned } = get();
    return BUILDINGS.some(
      (building) =>
        building.producesResource === resource && (owned[building.id] ?? 0) > 0,
    );
  },

  productionMultiplier: () => globalMultiplier(get().owned),

  isMilestoneBuilding: (id) =>
    BUILDINGS.find((b) => b.id === id)?.isMilestone === true,

  isFinaleBuilding: (id) =>
    BUILDINGS.find((b) => b.id === id)?.isFinale === true,
}));
