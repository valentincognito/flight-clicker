---
name: planned-upgrades-shop
description: Upgrades shop — speed-multiplier upgrades that speed up a building's cycle
metadata:
  type: project
---

The shop is tabbed (Buildings / Upgrades). Upgrades are one-time speed boosts for
a target building, modeled as a **speed multiplier** ([upgrades.ts]). Currently
one test upgrade exists: "Tide Pool ×2 Speed" for 1000 driftwood.

**The model (important, non-obvious):** a `speedMultiplier` of N shortens the
target's *effective* cycle to `baseCycle / N` AND scales throughput ×N, while
payout-per-cycle stays invariant (effectiveRate × effectiveCycle = base). So
buying a speed upgrade makes the bar visibly fill N× faster and resources climb
N× faster, but the "+X / cycle" shop label does NOT change. This was the
deliberate choice (vs. the trap where shrinking cycleTime alone is cosmetic-only
and would make the per-cycle label drop).

**How to apply / extend:** add entries to `UPGRADES` in [upgrades.ts];
`computeBuildingSpeed(buildingId, ownedUpgrades)` multiplies all owned upgrades
targeting a building. The speed factor is used in the store's `tick`, the
`buildingSpeed(id)` selector (feeds the bar's duration in [BuildingCard.tsx]),
and offline accrual in [persistence.ts]. Upgrades persist in save state
(`upgrades: Record<id, boolean>`, optional in SaveData so old saves still load).
Next idea: owned-count milestones (×2 speed at 25/50/100) for the escalating feel.
