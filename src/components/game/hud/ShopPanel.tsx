import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BuildingCard } from '@/components/game/hud/BuildingCard';
import { BUILDINGS, buildingCost } from '@/game/buildings';
import { useGameStore } from '@/game/gameStore';

/** Bottom shop panel: building cards presented as card-style UI over the world. */
export function ShopPanel() {
  const owned = useGameStore((s) => s.owned);
  const resources = useGameStore((s) => s.resources);
  const buyBuilding = useGameStore((s) => s.buyBuilding);
  const productionMultiplier = useGameStore((s) => s.productionMultiplier);
  const insets = useSafeAreaInsets();

  // Recomputed on every render (the store notifies on each tick / purchase), so
  // the per-building yields the cards show stay in sync with owned multipliers.
  const multiplier = productionMultiplier();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingTop: insets.top + 56 }]}>
      <View style={styles.panel}>
        <Text style={styles.heading}>Harbor Shop</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cards}>
          {BUILDINGS.map((building) => {
            const count = owned[building.id] ?? 0;
            const costs = buildingCost(building, count);
            const canAfford = costs.every((cost) => resources[cost.resource] >= cost.amount);
            return (
              <BuildingCard
                key={building.id}
                building={building}
                owned={count}
                costs={costs}
                canAfford={canAfford}
                multiplier={multiplier}
                onBuy={() => buyBuilding(building.id)}
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 12,
  },
  panel: {
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    backgroundColor: 'rgba(12,26,40,0.55)',
  },
  heading: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  cards: {
    gap: 10,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
});
