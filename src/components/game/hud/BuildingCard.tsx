import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { BuildingIcon, ResourceIcon } from '@/components/game/hud/gameIcons';
import { TICK_MS } from '@/game/gameStore';
import type { Building, BuildingCost, CurrencyId } from '@/types/game';
import { formatAmount, formatRate } from '@/utils/format';

interface Props {
  building: Building;
  owned: number;
  /** All cost lines for the next unit; a purchase may need several resources. */
  costs: BuildingCost[];
  canAfford: boolean;
  /** Current global production multiplier, so yields shown are effective/live. */
  multiplier: number;
  /** Fill fraction (0..1) of this building's current production cycle. */
  cycleFraction: number;
  onBuy: () => void;
}

/** Fill colour of each resource's production bar. */
const BAR_COLOR: Record<CurrencyId, string> = {
  driftwood: '#a9743f',
  seaGlass: '#2f9c9c',
  starlight: '#e0b23a',
};

/**
 * The production-cycle bar. Fills smoothly toward `fraction` over one tick, and
 * snaps back instantly when the cycle wraps (fraction drops) so a completed
 * payout reads as a clean reset rather than the bar animating backwards.
 */
function ProductionBar({ fraction, color }: { fraction: number; color: string }) {
  const fill = useSharedValue(fraction);
  const prev = useRef(fraction);

  useEffect(() => {
    if (fraction < prev.current) {
      fill.value = fraction;
    } else {
      fill.value = withTiming(fraction, { duration: TICK_MS, easing: Easing.linear });
    }
    prev.current = fraction;
  }, [fraction, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: Math.min(1, Math.max(0, fill.value)) }],
  }));

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

/**
 * The live "what does this produce" block. Producers show the current owned
 * total rate plus the cycle bar (or a muted single-unit preview before you own
 * any); multiplier buildings show the global bonus; the finale has neither.
 */
function BuildingYield({
  building,
  owned,
  multiplier,
  cycleFraction,
}: Pick<Props, 'building' | 'owned' | 'multiplier' | 'cycleFraction'>) {
  if (building.isMultiplier) {
    const perUnit = Math.round((building.multiplierBonus ?? 0) * 100);
    return (
      <View style={styles.yieldRow}>
        <Text style={styles.yieldGlyph}>⚡</Text>
        <Text style={styles.yield}>
          {owned > 0 ? `+${perUnit * owned}% output` : `+${perUnit}% output`}
        </Text>
      </View>
    );
  }

  if (building.producesResource) {
    if (owned <= 0) {
      // Not built yet: a muted hint of what a single unit would make.
      return (
        <View style={styles.yieldRow}>
          <ResourceIcon currency={building.producesResource} size={12} />
          <Text style={styles.yieldPreview}>+{formatRate(building.productionRate * multiplier)}/s</Text>
        </View>
      );
    }
    const total = building.productionRate * owned * multiplier;
    return (
      <View style={styles.yieldWrap}>
        <View style={styles.yieldRow}>
          <ResourceIcon currency={building.producesResource} size={12} />
          <Text style={styles.yield}>{formatRate(total)}/s</Text>
        </View>
        <ProductionBar fraction={cycleFraction} color={BAR_COLOR[building.producesResource]} />
      </View>
    );
  }

  return <Text style={styles.yieldNote}>completes the flight</Text>;
}

/** A single shop card. Grays out and disables itself when unaffordable. */
export function BuildingCard({
  building,
  owned,
  costs,
  canAfford,
  multiplier,
  cycleFraction,
  onBuy,
}: Props) {
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
      <BuildingYield
        building={building}
        owned={owned}
        multiplier={multiplier}
        cycleFraction={cycleFraction}
      />
      <View style={styles.costList}>
        {costs.map((cost) => (
          <View key={cost.resource} style={styles.costRow}>
            <ResourceIcon currency={cost.resource} size={14} />
            <Text style={[styles.cost, !canAfford && styles.costBlocked]}>
              {formatAmount(cost.amount)}
            </Text>
          </View>
        ))}
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
  yieldWrap: {
    gap: 4,
  },
  yieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yieldGlyph: {
    fontSize: 12,
  },
  yield: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0b6b8c',
    fontVariant: ['tabular-nums'],
  },
  yieldPreview: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a97a3',
    fontVariant: ['tabular-nums'],
  },
  yieldNote: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9a7a2a',
    fontStyle: 'italic',
  },
  barTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(27,42,58,0.12)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    width: '100%',
    borderRadius: 3,
    transformOrigin: '0% 50%',
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
