/**
 * Identifiers for every currency/resource in the game. Buildings both produce
 * and cost these; keeping them as a union means producing/costing currencies
 * are type-checked at the definition site.
 */
export type CurrencyId = 'driftwood' | 'seaGlass' | 'starlight';

/**
 * Static, data-only definition of a building. All runtime state (how many are
 * owned, current resource amounts) lives in the game store — never here.
 */
export interface Building {
  /** Stable unique id, e.g. `'fishingBoat'`. */
  id: string;
  /** Human-readable name shown in the UI. */
  name: string;
  /** Cost of the very first unit, expressed in `costCurrency`. */
  baseCost: number;
  /** Per-unit price growth: `cost = baseCost * costMultiplier ** ownedCount`. */
  costMultiplier: number;
  /** Amount of `productionCurrency` generated per second, per owned unit. */
  productionRate: number;
  /** The currency this building generates. */
  productionCurrency: CurrencyId;
  /** The currency spent to buy one unit of this building. */
  costCurrency: CurrencyId;
}

/** Current amount held of every currency. */
export type ResourceState = Record<CurrencyId, number>;
