import { create } from 'zustand';

import { BUILDINGS, buildingCost } from '@/game/buildings';
import type { CurrencyId, ResourceState } from '@/types/game';

/** The resource the player gathers by tapping, and that seeds the economy. */
export const PRIMARY_CURRENCY: CurrencyId = 'driftwood';

/** How much the primary resource increases per manual tap. */
export const TAP_AMOUNT = 1;

/** Owned count per building, keyed by building id. */
type OwnedState = Record<string, number>;

interface GameState {
  /** Current amount held of every currency. */
  resources: ResourceState;
  /** How many of each building the player owns. */
  owned: OwnedState;
  /** Advance the economy by one tick (one second of production). */
  tick: () => void;
  /** Buy one unit of `id` if affordable, deducting its cost. Returns success. */
  buyBuilding: (id: string) => boolean;
  /** Manual tap: bump the primary resource by `TAP_AMOUNT`. */
  tapBoost: () => void;
}

function initialResources(): ResourceState {
  return { driftwood: 0, seaGlass: 0, starlight: 0 };
}

function initialOwned(): OwnedState {
  return Object.fromEntries(BUILDINGS.map((building) => [building.id, 0]));
}

export const useGameStore = create<GameState>()((set, get) => ({
  resources: initialResources(),
  owned: initialOwned(),

  tick: () =>
    set((state) => {
      const resources = { ...state.resources };
      for (const building of BUILDINGS) {
        const count = state.owned[building.id] ?? 0;
        if (count > 0) {
          resources[building.productionCurrency] += count * building.productionRate;
        }
      }
      return { resources };
    }),

  buyBuilding: (id) => {
    const { resources, owned } = get();
    const building = BUILDINGS.find((b) => b.id === id);
    if (!building) return false;

    const count = owned[id] ?? 0;
    const cost = buildingCost(building, count);
    if (resources[building.costCurrency] < cost) return false;

    set({
      resources: {
        ...resources,
        [building.costCurrency]: resources[building.costCurrency] - cost,
      },
      owned: { ...owned, [id]: count + 1 },
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
}));
