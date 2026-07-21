import { Text } from 'react-native';

import type { CurrencyId } from '@/types/game';

/**
 * Placeholder icon glyphs. These stand in for real art so nothing breaks before
 * assets exist. To swap in real icons, drop a PNG into `assets/images/icons/`
 * (named in the comments below) and replace the returned <Text> glyph with
 * `<Image source={require('@/assets/images/icons/<name>.png')} ... />` — only
 * this file changes; every caller keeps using <ResourceIcon> / <BuildingIcon>.
 */
const RESOURCE_GLYPH: Record<CurrencyId, string> = {
  driftwood: '🪵', //  -> icons/driftwood.png
  seaGlass: '🔷', //   -> icons/sea-glass.png
  starlight: '✨', //  -> icons/starlight.png
};

const BUILDING_GLYPH: Record<string, string> = {
  fishingBoat: '🚤', //    -> icons/fishing-boat.png
  tradingShip: '⛵', //     -> icons/trading-ship.png
  lighthouseBeam: '🗼', //  -> icons/lighthouse-beam.png
};

export function ResourceIcon({ currency, size = 18 }: { currency: CurrencyId; size?: number }) {
  return <Text style={{ fontSize: size, lineHeight: size + 2 }}>{RESOURCE_GLYPH[currency] ?? '❔'}</Text>;
}

export function BuildingIcon({ buildingId, size = 28 }: { buildingId: string; size?: number }) {
  return <Text style={{ fontSize: size, lineHeight: size + 2 }}>{BUILDING_GLYPH[buildingId] ?? '❔'}</Text>;
}
