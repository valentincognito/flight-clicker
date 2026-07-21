import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BuildingIcon, ResourceIcon } from '@/components/game/hud/gameIcons';
import type { Building } from '@/types/game';
import { formatAmount } from '@/utils/format';

interface Props {
  building: Building;
  owned: number;
  cost: number;
  canAfford: boolean;
  onBuy: () => void;
}

/** A single shop card. Grays out and disables itself when unaffordable. */
export function BuildingCard({ building, owned, cost, canAfford, onBuy }: Props) {
  return (
    <Pressable
      onPress={onBuy}
      disabled={!canAfford}
      style={({ pressed }) => [
        styles.card,
        !canAfford && styles.cardDisabled,
        pressed && canAfford && styles.cardPressed,
      ]}>
      <View style={styles.header}>
        <BuildingIcon buildingId={building.id} />
        <Text style={styles.owned}>×{owned}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {building.name}
      </Text>
      <View style={styles.costRow}>
        <ResourceIcon currency={building.costCurrency} size={14} />
        <Text style={[styles.cost, !canAfford && styles.costBlocked]}>{formatAmount(cost)}</Text>
      </View>
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
  },
  owned: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a5b6b',
    fontVariant: ['tabular-nums'],
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b2a3a',
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
