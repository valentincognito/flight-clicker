/**
 * Identifiers for every currency/resource in the game. Buildings both produce
 * and cost these; keeping them as a union means producing/costing currencies
 * are type-checked at the definition site.
 *
 * Progression order: `driftwood` is the primary, always-available resource;
 * `seaGlass` and `starlight` stay locked until a building that produces them is
 * bought (see the store's `isResourceUnlocked`).
 */
export type CurrencyId = 'driftwood' | 'seaGlass' | 'starlight';

/**
 * A single cost line for buying a building: `amount` of `resource` at base
 * price. A building can have several, so a purchase may require more than one
 * currency at once (e.g. Signal Fire needs both seaGlass and starlight).
 */
export interface BuildingCost {
  resource: CurrencyId;
  /** Base amount before the per-owned `costMultiplier` growth is applied. */
  amount: number;
}

/**
 * Static, data-only definition of a building. All runtime state (how many are
 * owned, current resource amounts) lives in the game store — never here.
 */
export interface Building {
  /** Stable unique id, e.g. `'fishingBoat'`. */
  id: string;
  /** Human-readable name shown in the UI. */
  name: string;
  /**
   * The currency this building generates per tick, or `null` for pure
   * multiplier buildings that boost global production instead of producing.
   */
  producesResource: CurrencyId | null;
  /**
   * Long-run amount of `producesResource` generated per second, per owned unit.
   * Payouts are batched into cycles (see `cycleTime`) but average out to this.
   */
  productionRate: number;
  /**
   * Seconds per production cycle: the building pays out `productionRate *
   * cycleTime` (per owned unit) each time its progress bar fills, then resets.
   * Cheaper/earlier buildings use shorter cycles so they visibly tick faster.
   * Omitted (undefined) for buildings that don't produce a resource.
   */
  cycleTime?: number;
  /**
   * What one unit costs, as one line per resource. The very first unit costs
   * exactly these `amount`s; later units scale by `costMultiplier`.
   */
  costs: BuildingCost[];
  /** Per-unit price growth: `cost = amount * costMultiplier ** ownedCount`. */
  costMultiplier: number;
  /**
   * When true this building produces nothing and instead boosts the total
   * production of every other building by `multiplierBonus` per owned unit.
   */
  isMultiplier: boolean;
  /**
   * Flat fraction added to the global production multiplier per owned unit
   * (e.g. `0.1` = +10%). Only meaningful when `isMultiplier` is true.
   */
  multiplierBonus?: number;
  /**
   * Marks a building whose first purchase should trigger a milestone
   * celebration (e.g. Lighthouse Beam unlocking starlight). Read via the
   * store's `isMilestoneBuilding` selector — UI never hardcodes the id.
   */
  isMilestone?: boolean;
  /**
   * Marks the final building; purchasing it triggers the flight-complete /
   * finale flow. Read via the store's `isFinaleBuilding` selector.
   */
  isFinale?: boolean;
}

/** Current amount held of every currency. */
export type ResourceState = Record<CurrencyId, number>;

/**
 * Summary of what accrued while the app was closed, produced when a save is
 * loaded. `null` when nothing was earned (fresh start or no time elapsed); the
 * UI can surface it as a "welcome back" message.
 */
export interface OfflineReport {
  /** Seconds credited toward accumulation (already capped). */
  seconds: number;
  /** Amount gained per resource while away. */
  gained: ResourceState;
}
