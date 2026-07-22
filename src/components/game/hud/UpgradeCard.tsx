import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ResourceIcon } from '@/components/game/hud/gameIcons';
import type { Upgrade } from '@/types/game';
import { formatAmount } from '@/utils/format';

interface Props {
  upgrade: Upgrade;
  owned: boolean;
  canAfford: boolean;
  onBuy: () => void;
}

/**
 * A single upgrade card. Once purchased it's shown as owned and disabled;
 * otherwise it grays out when unaffordable, like the building cards.
 */
export function UpgradeCard({ upgrade, owned, canAfford, onBuy }: Props) {
  const disabled = owned || !canAfford;
  return (
    <Pressable
      onPress={onBuy}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
      ]}>
      <View style={styles.header}>
        <Text style={styles.glyph}>⏩</Text>
        {owned && <Text style={styles.ownedTag}>OWNED</Text>}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {upgrade.name}
      </Text>
      <Text style={styles.effect}>×{upgrade.speedMultiplier} speed</Text>
      {owned ? (
        <Text style={styles.ownedNote}>Purchased</Text>
      ) : (
        <View style={styles.costList}>
          {upgrade.costs.map((cost) => (
            <View key={cost.resource} style={styles.costRow}>
              <ResourceIcon currency={cost.resource} size={14} />
              <Text style={[styles.cost, !canAfford && styles.costBlocked]}>
                {formatAmount(cost.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    borderRadius: 16,
    padding: 12,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(27,42,58,0.08)',
  },
  cardDisabled: {
    opacity: 0.45,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 18,
  },
  glyph: {
    fontSize: 22,
  },
  ownedTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#1b6b3a',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b2a3a',
  },
  effect: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0b6b8c',
  },
  ownedNote: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7a8896',
    fontStyle: 'italic',
  },
  costList: {
    gap: 2,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b6b3a',
    fontVariant: ['tabular-nums'],
  },
  costBlocked: {
    color: '#b23a3a',
  },
});
