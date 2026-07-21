import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

/**
 * Placeholder scene art, drawn as simple SVG so the game looks like a layered
 * cove before any real art exists. Each sprite fills its parent container, so
 * CoveScene owns all positioning/sizing.
 *
 * SWAPPING IN REAL ART (no changes anywhere else): drop the named PNG into
 * `assets/images/scene/` and replace that sprite's <Svg> body with:
 *
 *   <Image source={require('@/assets/images/scene/<name>.png')}
 *          style={StyleSheet.absoluteFill} resizeMode="contain" />
 *
 * The export name and props stay the same, so CoveScene never changes.
 */
type SpriteProps = { style?: StyleProp<ViewStyle> };

/** Full-bleed dawn sky with a soft sun. -> scene/sky.png */
export function SkySprite({ style }: SpriteProps) {
  return (
    <View pointerEvents="none" style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="skyFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FADFC0" />
            <Stop offset="0.55" stopColor="#F6C6AE" />
            <Stop offset="1" stopColor="#CFE4F2" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#skyFill)" />
        <Circle cx="74" cy="30" r="16" fill="#FFF3D6" opacity={0.7} />
        <Circle cx="74" cy="30" r="9" fill="#FFF9EC" />
      </Svg>
    </View>
  );
}

/** Full-bleed teal water with a couple of light wave bands. -> scene/water.png */
export function WaterSprite({ style }: SpriteProps) {
  return (
    <View pointerEvents="none" style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6FB3CE" />
            <Stop offset="1" stopColor="#2E6E86" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#waterFill)" />
        <Path d="M0 26 Q50 20 100 26 L100 32 Q50 26 0 32 Z" fill="#FFFFFF" opacity={0.12} />
        <Path d="M0 55 Q50 49 100 55 L100 60 Q50 54 0 60 Z" fill="#FFFFFF" opacity={0.08} />
      </Svg>
    </View>
  );
}

/** Striped tower with a lit lantern room. -> scene/lighthouse.png */
export function LighthouseSprite({ style }: SpriteProps) {
  return (
    <View pointerEvents="none" style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
        {/* rock base */}
        <Path d="M4 192 Q22 168 44 178 Q66 188 96 190 L96 200 L4 200 Z" fill="#7A8B7F" />
        <Path d="M4 200 L96 200 L96 194 Q60 190 40 184 Q20 178 4 194 Z" fill="#5F6E63" />
        {/* tower */}
        <Path d="M40 62 L60 62 L66 186 L34 186 Z" fill="#F4F5F2" />
        {/* red bands (follow the tower taper) */}
        <Path d="M38.4 96 L61.6 96 L62.6 116 L37.4 116 Z" fill="#C0453F" />
        <Path d="M36.2 140 L63.8 140 L64.7 160 L35.3 160 Z" fill="#C0453F" />
        {/* gallery deck */}
        <Rect x="30" y="56" width="40" height="8" rx="1" fill="#37474F" />
        {/* lantern glass + frame */}
        <Rect x="39" y="36" width="22" height="20" fill="#FFE7A0" />
        <Circle cx="50" cy="46" r="6" fill="#FFF6D6" opacity={0.9} />
        <Rect x="39" y="36" width="22" height="20" fill="none" stroke="#37474F" strokeWidth="2" />
        {/* roof + finial */}
        <Polygon points="36,36 64,36 50,18" fill="#C0453F" />
        <Circle cx="50" cy="16" r="2" fill="#37474F" />
      </Svg>
    </View>
  );
}

/** Translucent searchlight cone; CoveScene rotates + pulses it. -> scene/lighthouse-beam.png */
export function LighthouseBeamSprite({ style }: SpriteProps) {
  return (
    <View pointerEvents="none" style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 120 140" preserveAspectRatio="xMidYMax meet">
        <Defs>
          <LinearGradient id="beamFill" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#FFF3B0" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#FFF3B0" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Polygon points="60,140 108,6 12,6" fill="url(#beamFill)" />
      </Svg>
    </View>
  );
}

/** Wooden dock with pilings. -> scene/dock.png */
export function DockSprite({ style }: SpriteProps) {
  return (
    <View pointerEvents="none" style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="xMidYMax meet">
        <Rect x="14" y="26" width="6" height="30" fill="#7A4E2C" />
        <Rect x="78" y="26" width="6" height="30" fill="#7A4E2C" />
        <Rect x="6" y="14" width="86" height="12" rx="1.5" fill="#9C6B3F" />
        <Rect x="6" y="17" width="86" height="1.5" fill="#7A4E2C" opacity={0.6} />
        <Rect x="6" y="21" width="86" height="1.5" fill="#7A4E2C" opacity={0.6} />
      </Svg>
    </View>
  );
}

/** Small fishing boat with a stub sail. -> scene/fishing-boat.png */
export function FishingBoatSprite({ style }: SpriteProps) {
  return (
    <View pointerEvents="none" style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 100 70" preserveAspectRatio="xMidYMax meet">
        <Path d="M14 40 L86 40 L74 60 L26 60 Z" fill="#C0552F" />
        <Rect x="14" y="40" width="72" height="5" fill="#E8E0D0" />
        <Rect x="40" y="24" width="18" height="16" rx="2" fill="#5A3E2B" />
        <Rect x="49" y="8" width="2.5" height="18" fill="#5A3E2B" />
        <Polygon points="34,24 34,8 50,24" fill="#F2E7CE" />
      </Svg>
    </View>
  );
}

/** Larger trading ship with twin sails and a flag. -> scene/trading-ship.png */
export function TradingShipSprite({ style }: SpriteProps) {
  return (
    <View pointerEvents="none" style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 120 92" preserveAspectRatio="xMidYMax meet">
        <Path d="M8 50 L112 50 L96 76 L24 76 Z" fill="#3E5C76" />
        <Rect x="8" y="50" width="104" height="6" fill="#E8E0D0" />
        <Rect x="58" y="6" width="3" height="46" fill="#5A3E2B" />
        <Polygon points="60,10 60,48 30,44" fill="#F5EFE0" />
        <Polygon points="60,12 60,46 88,44" fill="#EFE7D4" />
        <Polygon points="61,6 61,14 74,10" fill="#D9534F" />
      </Svg>
    </View>
  );
}

/** A string of warm harbor lights. -> scene/harbor-lights.png */
export function HarborLightsSprite({ style }: SpriteProps) {
  const bulbs = [20, 52, 84, 116, 148, 180];
  return (
    <View pointerEvents="none" style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 200 30" preserveAspectRatio="xMidYMid meet">
        <Path d="M4 10 Q100 2 196 10" stroke="#4A3B2A" strokeWidth="1.5" fill="none" />
        {bulbs.map((cx) => (
          <Circle key={`glow-${cx}`} cx={cx} cy={13} r={6} fill="#FFE9A8" opacity={0.4} />
        ))}
        {bulbs.map((cx) => (
          <Circle key={`bulb-${cx}`} cx={cx} cy={13} r={3} fill="#FFD27A" />
        ))}
      </Svg>
    </View>
  );
}
