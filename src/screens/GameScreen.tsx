import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { MilestoneOverlay } from '@/components/game/MilestoneOverlay';
import { ShopPanel } from '@/components/game/hud/ShopPanel';
import { TopBar } from '@/components/game/hud/TopBar';
import { CoveScene } from '@/components/game/scene/CoveScene';
import { useGameStore } from '@/game/gameStore';
import { useMilestoneWatcher } from '@/hooks/use-milestone-watcher';

/**
 * GameScreen stacks three layers over a single relative root:
 *   1. CoveScene    — background world: tappable water + owned-building sprites
 *   2. HUD          — TopBar (live resources) + ShopPanel (buildings), overlaid
 *   3. Milestone    — celebration overlay shown when a threshold is crossed
 *
 * Presentation only: the tick loop below is unchanged from Phase 1, and no game
 * logic (gameStore / buildings) is touched.
 */
export default function GameScreen() {
  const { milestone, dismiss } = useMilestoneWatcher();

  // Game loop: tick once per second while this screen is mounted, cleaned up on unmount.
  useEffect(() => {
    const interval = setInterval(() => {
      useGameStore.getState().tick();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.root}>
      <CoveScene />
      <TopBar />
      <ShopPanel />
      {milestone && (
        <MilestoneOverlay
          key={`${milestone.buildingId}-${milestone.threshold}`}
          milestone={milestone}
          onDismiss={dismiss}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
});
