import { useCallback, useEffect, useState } from 'react';

import { BUILDINGS } from '@/game/buildings';
import { useGameStore } from '@/game/gameStore';
import { crossedMilestone, type Milestone } from '@/game/milestones';

/**
 * Watches building ownership in the game store and surfaces a milestone whenever
 * an owned count crosses a threshold. Read-only — it subscribes to store changes
 * and never mutates game state, so the economy / tick loop are unaffected.
 */
export function useMilestoneWatcher() {
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    // Fires on every store change; we only act when an `owned` count increases.
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      for (const building of BUILDINGS) {
        const before = prevState.owned[building.id] ?? 0;
        const after = state.owned[building.id] ?? 0;
        if (after > before) {
          const crossed = crossedMilestone(building.id, before, after);
          if (crossed) {
            setMilestone(crossed);
            break;
          }
        }
      }
    });
    return unsubscribe;
  }, []);

  const dismiss = useCallback(() => setMilestone(null), []);

  return { milestone, dismiss };
}
