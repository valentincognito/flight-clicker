import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin JSON wrapper over AsyncStorage (the SDK 57 recommended local key-value
 * store; backed by localStorage on web). All calls are best-effort: reads that
 * fail or find nothing return `null`, writes swallow errors, so a storage
 * hiccup never crashes the game.
 */

/** Read and JSON-parse a stored value, or `null` if missing/corrupt. */
export async function loadJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** JSON-serialize and store a value. */
export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best-effort: ignore transient write failures.
  }
}

/** Remove a stored value. */
export async function removeJSON(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Best-effort: ignore.
  }
}
