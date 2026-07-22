import { useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type DimensionValue,
  type GestureResponderEvent,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  DockSprite,
  FishingBoatSprite,
  HarborLightsSprite,
  LighthouseBeamSprite,
  LighthouseSprite,
  SkySprite,
  TradingShipSprite,
  WaterSprite,
} from '@/components/game/scene/sceneAssets';
import {
  TapSparkleLayer,
  type TapSparkleLayerHandle,
} from '@/components/game/scene/TapSparkleLayer';
import { useGameStore } from '@/game/gameStore';

type Slot = { left: DimensionValue; top: DimensionValue; width: DimensionValue };

// Preset positions (percent of the water area) so that extra owned buildings
// populate the cove without overlapping. Each entry beyond the count is unused.
const FISHING_BOAT_SLOTS: Slot[] = [
  { left: '8%', top: '30%', width: '20%' },
  { left: '32%', top: '16%', width: '15%' },
  { left: '20%', top: '52%', width: '23%' },
  { left: '2%', top: '66%', width: '17%' },
];
const TRADING_SHIP_SLOTS: Slot[] = [
  { left: '54%', top: '22%', width: '30%' },
  { left: '40%', top: '56%', width: '25%' },
];
const BOAT_ASPECT = 100 / 70;
const SHIP_ASPECT = 120 / 92;

/**
 * Bottom scene layer: sky, water, lighthouse and dock, plus boats / ships /
 * harbor lights / a second dock that appear as their buildings are owned. The
 * water is tappable — a tap calls tapBoost() and spawns a sparkle where it lands.
 */
export function CoveScene() {
  const owned = useGameStore((s) => s.owned);
  const tapBoost = useGameStore((s) => s.tapBoost);

  const fishingBoatCount = owned.fishingBoat ?? 0;
  const tradingShipCount = owned.tradingShip ?? 0;
  const ownsBeam = (owned.lighthouseBeam ?? 0) > 0;

  const fishingBoatSlots = FISHING_BOAT_SLOTS.slice(0, Math.min(fishingBoatCount, FISHING_BOAT_SLOTS.length));
  const tradingShipSlots = TRADING_SHIP_SLOTS.slice(0, Math.min(tradingShipCount, TRADING_SHIP_SLOTS.length));

  const sparkleLayer = useRef<TapSparkleLayerHandle>(null);

  const handleWaterTap = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      tapBoost();
      // Imperative spawn: only the sparkle layer re-renders, not this scene.
      sparkleLayer.current?.spawn(locationX, locationY);
    },
    [tapBoost],
  );

  // Gentle pulse for the lighthouse beam once it is switched on.
  const beamPulse = useSharedValue(0.65);
  useEffect(() => {
    if (ownsBeam) {
      beamPulse.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    } else {
      beamPulse.value = 0.65;
    }
  }, [ownsBeam, beamPulse]);
  const beamStyle = useAnimatedStyle(() => ({ opacity: beamPulse.value }));

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <SkySprite style={styles.sky} />

      <Pressable style={styles.water} onPress={handleWaterTap}>
        <WaterSprite style={StyleSheet.absoluteFill} />

        {tradingShipSlots.map((slot, index) => (
          <View
            key={`ship-${index}`}
            pointerEvents="none"
            style={{ position: 'absolute', left: slot.left, top: slot.top, width: slot.width, aspectRatio: SHIP_ASPECT }}>
            <TradingShipSprite style={StyleSheet.absoluteFill} />
          </View>
        ))}

        {fishingBoatSlots.map((slot, index) => (
          <View
            key={`boat-${index}`}
            pointerEvents="none"
            style={{ position: 'absolute', left: slot.left, top: slot.top, width: slot.width, aspectRatio: BOAT_ASPECT }}>
            <FishingBoatSprite style={StyleSheet.absoluteFill} />
          </View>
        ))}

        <TapSparkleLayer ref={sparkleLayer} />
      </Pressable>

      {tradingShipCount >= 1 && <HarborLightsSprite style={styles.harborLights} />}
      <DockSprite style={styles.dock} />
      {tradingShipCount >= 3 && <DockSprite style={styles.dockSecond} />}
      <LighthouseSprite style={styles.lighthouse} />

      {ownsBeam && (
        <Animated.View pointerEvents="none" style={[styles.beam, beamStyle]}>
          <LighthouseBeamSprite style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sky: { position: 'absolute', top: 0, left: 0, right: 0, height: '62%' },
  water: { position: 'absolute', top: '56%', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  harborLights: { position: 'absolute', left: '6%', bottom: '32%', width: '42%', aspectRatio: 200 / 30 },
  dock: { position: 'absolute', left: '5%', bottom: '22%', width: '34%', aspectRatio: 100 / 60 },
  dockSecond: { position: 'absolute', left: '1%', bottom: '9%', width: '30%', aspectRatio: 100 / 60 },
  lighthouse: { position: 'absolute', right: '7%', bottom: '26%', width: '26%', aspectRatio: 100 / 200 },
  beam: {
    position: 'absolute',
    right: '4%',
    bottom: '46%',
    width: '62%',
    aspectRatio: 120 / 140,
    transform: [{ rotate: '-24deg' }],
    transformOrigin: '50% 100%',
  },
});
