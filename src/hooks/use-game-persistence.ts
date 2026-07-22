import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useGameStore } from '@/game/gameStore';
import { applyOffline, loadSave, writeSave } from '@/game/persistence';

/** How often to autosave while the app is foregrounded, in ms. */
const AUTOSAVE_MS = 5000;

/**
 * Drives save/load for the game:
 *   1. On mount, load the save (applying offline accumulation) and mark the
 *      store hydrated. Until that happens, saving is suppressed so the initial
 *      default state can't clobber a real save.
 *   2. While mounted, autosave periodically and whenever the app backgrounds
 *      (the background save is what makes offline accrual accurate).
 *
 * Returns whether hydration has finished, so the caller can gate the tick loop.
 */
export function useGamePersistence() {
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  // Stable best-effort snapshot writer; no-ops until hydration completes.
  const save = useCallback(() => {
    if (!readyRef.current) return;
    const { resources, owned, progress, flightComplete } = useGameStore.getState();
    void writeSave({ resources, owned, progress, flightComplete }, Date.now());
  }, []);

  // Load once, then open the gate.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadSave();
      if (cancelled) return;

      if (saved) {
        const { resources, progress, report } = applyOffline(saved, Date.now());
        useGameStore.getState().hydrate({
          resources,
          owned: saved.owned,
          progress,
          flightComplete: saved.flightComplete,
          offlineReport: report.seconds > 0 ? report : null,
        });
      } else {
        useGameStore.getState().markHydrated();
      }

      readyRef.current = true;
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Periodic autosave + save-on-background + a final save on unmount.
  useEffect(() => {
    const interval = setInterval(save, AUTOSAVE_MS);
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') save();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
      save();
    };
  }, [save]);

  return ready;
}
