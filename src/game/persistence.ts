import { BUILDINGS } from '@/game/buildings';
import { globalMultiplier } from '@/game/gameStore';
import { computeBuildingSpeed } from '@/game/upgrades';
import type { OfflineReport, ResourceState } from '@/types/game';
import { loadJSON, saveJSON } from '@/utils/storage';

/** Storage key and schema version (bump to invalidate incompatible old saves). */
const SAVE_KEY = 'flight-clicker/save/v1';
const SAVE_VERSION = 1;

/**
 * Ceiling on offline time that counts toward accumulation. Returning after a
 * long break gives a big — but bounded — reward instead of an absurd one, which
 * is the usual idle-game convention. Tune or remove to taste. (8 hours.)
 */
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;

/** The persisted snapshot. Only plain, serializable game state — no actions. */
export interface SaveData {
  version: number;
  resources: ResourceState;
  owned: Record<string, number>;
  progress: Record<string, number>;
  /** Purchased upgrades. Optional so pre-upgrades v1 saves still load. */
  upgrades?: Record<string, boolean>;
  flightComplete: boolean;
  /** Wall-clock ms when written; the basis for offline accumulation on load. */
  savedAt: number;
}

/** Read the current save, or `null` if absent/corrupt/incompatible version. */
export async function loadSave(): Promise<SaveData | null> {
  const save = await loadJSON<SaveData>(SAVE_KEY);
  if (!save || save.version !== SAVE_VERSION) return null;
  return save;
}

/** Write a snapshot, stamping the schema version and save time. */
export async function writeSave(
  snapshot: Omit<SaveData, 'version' | 'savedAt'>,
  now: number,
): Promise<void> {
  await saveJSON(SAVE_KEY, { version: SAVE_VERSION, savedAt: now, ...snapshot });
}

/**
 * Advance a loaded save forward by the wall-clock time the app was closed.
 *
 * Production is linear in time (each owned producer averages
 * `count * rate * multiplier` per second, and the multiplier can't change while
 * away since no buildings are bought), so offline gain is simply that rate times
 * the elapsed seconds — no need to replay individual cycles. Only resources with
 * an owned producer accrue, mirroring the live tick's unlock gating.
 */
export function applyOffline(
  save: SaveData,
  now: number,
): { resources: ResourceState; progress: Record<string, number>; report: OfflineReport } {
  // `now` and `savedAt` are both `Date.now()` — milliseconds since the UTC
  // epoch, which is timezone-independent, so crossing timezones mid-flight (or
  // the phone auto-switching zones on landing) does NOT skew this. The only
  // thing that could is the absolute system clock changing: a backward jump is
  // clamped to 0 (no negative gain), a forward jump is bounded by the cap.
  const elapsed = Math.max(0, Math.min(OFFLINE_CAP_SECONDS, (now - save.savedAt) / 1000));
  const resources: ResourceState = { ...save.resources };
  const progress: Record<string, number> = { ...save.progress };
  const gained: ResourceState = { driftwood: 0, seaGlass: 0, starlight: 0 };
  const multiplier = globalMultiplier(save.owned);
  const upgrades = save.upgrades ?? {};

  for (const building of BUILDINGS) {
    if (building.producesResource === null) continue;
    const count = save.owned[building.id] ?? 0;
    if (count <= 0) continue;

    // Throughput includes any speed upgrades (throughput scales with speed).
    const speed = computeBuildingSpeed(building.id, upgrades);
    const gain = elapsed * count * building.productionRate * speed * multiplier;
    resources[building.producesResource] += gain;
    gained[building.producesResource] += gain;

    // Keep cycle progress coherent (bars are decoupled, but the econ counter is
    // not) by advancing it within its effective cycle.
    const cycle = (building.cycleTime ?? 1) / speed;
    progress[building.id] = ((progress[building.id] ?? 0) + elapsed) % cycle;
  }

  return { resources, progress, report: { seconds: elapsed, gained } };
}
