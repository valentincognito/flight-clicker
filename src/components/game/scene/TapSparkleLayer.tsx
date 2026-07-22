import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';

import { TapSparkle } from '@/components/game/scene/TapSparkle';

// Cap concurrent bursts so rapid tapping can't grow the list without bound or
// flood the UI thread with particle animations.
const MAX_SPARKLES = 6;

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

export interface TapSparkleLayerHandle {
  /** Spawn a burst at (x, y), in the layer's local coordinate space. */
  spawn: (x: number, y: number) => void;
}

/**
 * Owns the live tap-sparkle bursts and spawns them imperatively via a ref, so a
 * tap only re-renders this small layer — not the whole CoveScene (sprites,
 * lighthouse beam, boats…). Keeping tap-driven React churn off the main scene
 * frees the JS thread, which is what was making the shop's progress bars hitch
 * while tapping.
 */
export const TapSparkleLayer = forwardRef<TapSparkleLayerHandle>(function TapSparkleLayer(
  _props,
  ref,
) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const nextId = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      spawn: (x: number, y: number) => {
        const id = nextId.current;
        nextId.current += 1;
        setSparkles((prev) => {
          const next = [...prev, { id, x, y }];
          return next.length > MAX_SPARKLES ? next.slice(next.length - MAX_SPARKLES) : next;
        });
      },
    }),
    [],
  );

  const remove = useCallback((id: number) => {
    setSparkles((prev) => prev.filter((sparkle) => sparkle.id !== id));
  }, []);

  return (
    <>
      {sparkles.map((sparkle) => (
        <TapSparkle key={sparkle.id} id={sparkle.id} x={sparkle.x} y={sparkle.y} onDone={remove} />
      ))}
    </>
  );
});
