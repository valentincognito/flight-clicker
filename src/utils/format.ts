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
