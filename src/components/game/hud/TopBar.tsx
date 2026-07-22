import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResourceCounter } from '@/components/game/hud/ResourceCounter';
import { useGameStore } from '@/game/gameStore';
import type { CurrencyId } from '@/types/game';

// Display order for the HUD, following the economy's progression.
const RESOURCE_ORDER: CurrencyId[] = ['driftwood', 'seaGlass', 'starlight'];

/** Top HUD bar: live resource readouts overlaid on the scene. */
export function TopBar() {
  const resources = useGameStore((s) => s.resources);
  const owned = useGameStore((s) => s.owned);
  const isResourceUnlocked = useGameStore((s) => s.isResourceUnlocked);
  const insets = useSafeAreaInsets();

  // `owned` is read above purely so this re-evaluates as buildings are bought
  // and a previously-locked resource becomes visible.
  void owned;
  const visible = RESOURCE_ORDER.filter((currency) => isResourceUnlocked(currency));

  return (
    <View pointerEvents="box-none" style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {visible.map((currency) => (
          <ResourceCounter key={currency} currency={currency} amount={resources[currency]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
