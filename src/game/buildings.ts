import type { Building, BuildingCost } from '@/types/game';

/**
 * The full building set, defined purely as data. Purchase and production rules
 * are generic (see the game store and `buildingCost` below) — nothing here is
 * special-cased, so adding a building is just adding an entry to this array.
 *
 * Progression: driftwood buildings seed the economy; the Trading Ship is the
 * first seaGlass producer (unlocking that resource); the Lighthouse Beam is the
 * first starlight producer (unlocking that one). Two multiplier buildings boost
 * global output, and the Grand Beacon is the finale.
 *
 * Costs/rates are placeholder values for this logic-proving step; a later phase
 * (flightScaling) will calibrate them against flight duration. The 1.15 growth
 * curve is intentionally kept from the previous phase.
 */
const GROWTH = 1.15;

export const BUILDINGS: Building[] = [
  {
    id: 'tidePoolCollector',
    name: 'Tide Pool Collector',
    producesResource: 'driftwood',
    productionRate: 0.5,
    cycleTime: 0.5,
    costs: [{ resource: 'driftwood', amount: 10 }],
    costMultiplier: GROWTH,
    isMultiplier: false,
  },
  {
    id: 'driftnet',
    name: 'Driftnet',
    producesResource: 'driftwood',
    productionRate: 2,
    cycleTime: 1,
    costs: [{ resource: 'driftwood', amount: 120 }],
    costMultiplier: GROWTH,
    isMultiplier: false,
  },
  {
    id: 'fishingBoat',
    name: 'Fishing Boat',
    producesResource: 'driftwood',
    productionRate: 8,
    cycleTime: 2,
    costs: [{ resource: 'driftwood', amount: 1300 }],
    costMultiplier: GROWTH,
    isMultiplier: false,
  },
  {
    // First seaGlass producer: buying one unlocks the seaGlass resource.
    id: 'tradingShip',
    name: 'Trading Ship',
    producesResource: 'seaGlass',
    productionRate: 1,
    cycleTime: 3,
    costs: [{ resource: 'driftwood', amount: 14000 }],
    costMultiplier: GROWTH,
    isMultiplier: false,
  },
  {
    id: 'harborMarketStall',
    name: 'Harbor Market Stall',
    producesResource: 'seaGlass',
    productionRate: 5,
    cycleTime: 4,
    costs: [{ resource: 'seaGlass', amount: 250 }],
    costMultiplier: GROWTH,
    isMultiplier: false,
  },
  {
    // First starlight producer: buying one unlocks the starlight resource.
    id: 'lighthouseBeam',
    name: 'Lighthouse Beam',
    producesResource: 'starlight',
    productionRate: 0.2,
    cycleTime: 6,
    costs: [{ resource: 'seaGlass', amount: 3000 }],
    costMultiplier: GROWTH,
    isMultiplier: false,
    isMilestone: true,
  },
  {
    id: 'signalFire',
    name: 'Signal Fire',
    producesResource: 'starlight',
    productionRate: 1,
    cycleTime: 8,
    costs: [
      { resource: 'seaGlass', amount: 9000 },
      { resource: 'starlight', amount: 40 },
    ],
    costMultiplier: GROWTH,
    isMultiplier: false,
  },
  {
    id: 'harborTownHouses',
    name: 'Harbor Town Houses',
    producesResource: null,
    productionRate: 0,
    costs: [{ resource: 'starlight', amount: 200 }],
    costMultiplier: GROWTH,
    isMultiplier: true,
    multiplierBonus: 0.1, // +10% global production per unit
  },
  {
    id: 'secondDock',
    name: 'Second Dock',
    producesResource: null,
    productionRate: 0,
    costs: [
      { resource: 'starlight', amount: 500 },
      { resource: 'seaGlass', amount: 50000 },
    ],
    costMultiplier: GROWTH,
    isMultiplier: true,
    multiplierBonus: 0.25, // +25% global production per unit
  },
  {
    // Finale: purchasing this triggers the flight-complete flow.
    id: 'grandBeacon',
    name: 'Grand Beacon',
    producesResource: null,
    productionRate: 0,
    costs: [
      { resource: 'driftwood', amount: 1_000_000 },
      { resource: 'seaGlass', amount: 100_000 },
      { resource: 'starlight', amount: 5000 },
    ],
    costMultiplier: GROWTH,
    isMultiplier: false,
    isFinale: true,
  },
];

/**
 * Price of the next unit of `building` given how many are already owned: each
 * cost line grows as `amount * costMultiplier ** owned`, floored to a whole
 * number so the displayed price, the affordability check, and the deduction
 * always agree. Returns one entry per resource the purchase requires.
 */
export function buildingCost(building: Building, owned: number): BuildingCost[] {
  const factor = building.costMultiplier ** owned;
  return building.costs.map((cost) => ({
    resource: cost.resource,
    amount: Math.floor(cost.amount * factor),
  }));
}
