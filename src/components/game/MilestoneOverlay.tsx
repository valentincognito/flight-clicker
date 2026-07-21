import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import type { Milestone } from '@/game/milestones';

const AUTO_DISMISS_MS = 2600;

/**
 * Full-screen celebration overlaid on GameScreen — NOT a navigation change.
 * Fades/scales in, auto-dismisses after a couple seconds, and dismisses early on
 * tap. It is mounted only while a milestone is active, so reanimated plays the
 * exit animation when the parent unmounts it.
 */
export function MilestoneOverlay({
  milestone,
  onDismiss,
}: {
  milestone: Milestone;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Animated.View
      style={StyleSheet.absoluteFill}
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(200)}>
      <Pressable style={styles.scrim} onPress={onDismiss}>
        <Animated.View entering={ZoomIn.springify().damping(20).stiffness(130)} style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeGlyph}>★</Text>
          </View>
          <Text style={styles.kicker}>Milestone</Text>
          <Text style={styles.title}>{milestone.title}</Text>
          <Text style={styles.message}>{milestone.message}</Text>
          <Text style={styles.hint}>tap to continue</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,14,24,0.55)',
    padding: 32,
  },
  card: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
    paddingHorizontal: 32,
    borderRadius: 24,
    maxWidth: 340,
    backgroundColor: '#122b45',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD27A',
    marginBottom: 4,
  },
  badgeGlyph: {
    fontSize: 28,
    color: '#122b45',
  },
  kicker: {
    color: '#FFD27A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
  },
  hint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 8,
  },
});
