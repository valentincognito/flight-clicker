import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

const PARTICLE_COUNT = 5;
const BURST_RADIUS = 30;
const DURATION = 620;
const PARTICLE_COLORS = ['#FFE9A8', '#FFF6D6', '#BFE9FF', '#FFD27A'];

interface Props {
  id: number;
  x: number;
  y: number;
  onDone: (id: number) => void;
}

/**
 * A one-shot sparkle burst anchored at (x, y). Particles fly radially outward
 * and fade, then the burst removes itself via `onDone`. Non-interactive — taps
 * pass straight through to the water beneath it.
 */
export function TapSparkle({ id, x, y, onDone }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: DURATION, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished) {
          runOnJS(onDone)(id);
        }
      },
    );
  }, [id, onDone, progress]);

  return (
    <View pointerEvents="none" style={[styles.anchor, { left: x, top: y }]}>
      <Flash progress={progress} />
      {Array.from({ length: PARTICLE_COUNT }).map((_, index) => (
        <Particle
          key={index}
          angle={(index / PARTICLE_COUNT) * Math.PI * 2}
          color={PARTICLE_COLORS[index % PARTICLE_COLORS.length]}
          progress={progress}
        />
      ))}
    </View>
  );
}

function Flash({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: (1 - p) * 0.7,
      transform: [{ scale: 0.4 + p * 1.2 }],
    };
  });
  return <Animated.View style={[styles.flash, style]} />;
}

function Particle({
  angle,
  color,
  progress,
}: {
  angle: number;
  color: string;
  progress: SharedValue<number>;
}) {
  // Precompute the (constant) travel vector on the JS side so the per-frame
  // worklet only does cheap multiplies, not trig.
  const dx = Math.cos(angle) * BURST_RADIUS;
  const dy = Math.sin(angle) * BURST_RADIUS;
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    // Quick fade-in over the first slice of the burst, then fade out.
    const opacity = (1 - p) * (p < 0.15 ? p / 0.15 : 1);
    return {
      opacity,
      transform: [{ translateX: dx * p }, { translateY: dy * p }, { scale: 1 - p * 0.6 }],
    };
  });
  return <Animated.View style={[styles.particle, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  particle: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    marginLeft: -4.5,
    marginTop: -4.5,
  },
  flash: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    marginLeft: -13,
    marginTop: -13,
    backgroundColor: '#FFF6D6',
  },
});
