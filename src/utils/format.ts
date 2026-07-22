/**
 * Formats a per-second production rate for the shop cards. Unlike
 * `formatAmount`, small values keep one decimal so slow producers (e.g. a
 * 0.5/s collector) don't collapse to `0`; large values reuse the compact
 * k/M/… scale.
 */
export function formatRate(n: number): string {
  if (n >= 1000) return formatAmount(n);
  const decimals = n < 10 ? 1 : 0;
  const factor = 10 ** decimals;
  return String(Math.round(n * factor) / factor);
}

/** Compact whole-number formatting for HUD readouts (e.g. 999, 1.2k, 3.4M). */
export function formatAmount(n: number): string {
  const value = Math.floor(n);
  if (value < 1000) return String(value);

  const units = ['k', 'M', 'B', 'T', 'Qa', 'Qi'];
  let unitIndex = -1;
  let scaled = value;
  while (scaled >= 1000 && unitIndex < units.length - 1) {
    scaled /= 1000;
    unitIndex += 1;
  }
  const rounded = scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
  return `${rounded}${units[unitIndex]}`;
}
