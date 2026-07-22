import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BuildingCard } from '@/components/game/hud/BuildingCard';
import { UpgradeCard } from '@/components/game/hud/UpgradeCard';
import { BUILDINGS, buildingCost } from '@/game/buildings';
import { useGameStore } from '@/game/gameStore';
import { UPGRADES } from '@/game/upgrades';

type ShopTab = 'buildings' | 'upgrades';

const TABS: { key: ShopTab; label: string }[] = [
  { key: 'buildings', label: 'Buildings' },
  { key: 'upgrades', label: 'Upgrades' },
];

/** Bottom shop panel: tabbed card UI (Buildings / Upgrades) over the world. */
export function ShopPanel() {
  const owned = useGameStore((s) => s.owned);
  const resources = useGameStore((s) => s.resources);
  const upgrades = useGameStore((s) => s.upgrades);
  const buyBuilding = useGameStore((s) => s.buyBuilding);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const productionMultiplier = useGameStore((s) => s.productionMultiplier);
  const buildingSpeed = useGameStore((s) => s.buildingSpeed);
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<ShopTab>('buildings');

  // Recomputed on every render (the store notifies on each tick / purchase), so
  // the per-building yields the cards show stay in sync with owned multipliers.
  const multiplier = productionMultiplier();

  return (
    <View pointerEvents="box-none" style={[styles.container, { paddingTop: insets.top + 56 }]}>
      <View style={styles.panel}>
        <View style={styles.tabBar}>
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cards}>
          {tab === 'buildings'
            ? BUILDINGS.map((building) => {
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
                    speedMultiplier={buildingSpeed(building.id)}
                    onBuy={() => buyBuilding(building.id)}
                  />
                );
              })
            : UPGRADES.map((upgrade) => {
                const isOwned = upgrades[upgrade.id] ?? false;
                const canAfford = upgrade.costs.every(
                  (cost) => resources[cost.resource] >= cost.amount,
                );
                return (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    owned={isOwned}
                    canAfford={canAfford}
                    onBuy={() => buyUpgrade(upgrade.id)}
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
  tabBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
  },
  tabLabelActive: {
    color: '#122b45',
  },
  cards: {
    gap: 10,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
});
