import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { MilestoneOverlay } from '@/components/game/MilestoneOverlay';
import { ShopPanel } from '@/components/game/hud/ShopPanel';
import { TopBar } from '@/components/game/hud/TopBar';
import { CoveScene } from '@/components/game/scene/CoveScene';
import { TICK_MS, useGameStore } from '@/game/gameStore';
import { useGamePersistence } from '@/hooks/use-game-persistence';
import { useMilestoneWatcher } from '@/hooks/use-milestone-watcher';

/**
 * GameScreen stacks three layers over a single relative root:
 *   1. CoveScene    — background world: tappable water + owned-building sprites
 *   2. HUD          — TopBar (live resources) + ShopPanel (buildings), overlaid
 *   3. Milestone    — celebration overlay shown when a threshold is crossed
 *
 * It also owns the two app-level side effects: loading/saving the game (with
 * offline accumulation) via useGamePersistence, and the production tick loop —
 * which waits for hydration so it advances the loaded save, not default state.
 */
export default function GameScreen() {
  const { milestone, dismiss } = useMilestoneWatcher();
  // Load the save (with offline accumulation) and keep it saved; gates the loop.
  const hydrated = useGamePersistence();

  // Game loop: tick every TICK_MS while this screen is mounted (fine-grained so
  // the shop's production-cycle bars animate smoothly), cleaned up on unmount.
  // Waits for hydration so we tick the loaded save, not the default state.
  useEffect(() => {
    if (!hydrated) return;
    const interval = setInterval(() => {
      useGameStore.getState().tick();
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [hydrated]);

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
