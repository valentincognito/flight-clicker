import type { Building } from '@/types/game';

/**
 * Starter buildings, defined purely as data. Purchase and production rules are
 * generic (see the game store and `buildingCost` below) — nothing here is
 * special-cased, so adding a building is just adding an entry to this array.
 *
 * Costs/rates are placeholder values for this logic-proving step; a later phase
 * (flightScaling) will calibrate them against flight duration.
 */
export const BUILDINGS: Building[] = [
  {
    id: 'fishingBoat',
    name: 'Fishing Boat',
    baseCost: 10,
    costMultiplier: 1.15,
    productionRate: 1,
    productionCurrency: 'driftwood',
    costCurrency: 'driftwood',
  },
  {
    id: 'tradingShip',
    name: 'Trading Ship',
    baseCost: 100,
    costMultiplier: 1.15,
    productionRate: 1,
    productionCurrency: 'seaGlass',
    costCurrency: 'driftwood',
  },
  {
    id: 'lighthouseBeam',
    name: 'Lighthouse Beam',
    baseCost: 50,
    costMultiplier: 1.15,
    productionRate: 1,
    productionCurrency: 'starlight',
    costCurrency: 'seaGlass',
  },
];

/**
 * Price of the next unit of `building` given how many are already owned:
 * `baseCost * costMultiplier ** owned`, floored to a whole number so the
 * displayed price, the affordability check, and the deduction always agree.
 */
export function buildingCost(building: Building, owned: number): number {
  return Math.floor(building.baseCost * building.costMultiplier ** owned);
}
