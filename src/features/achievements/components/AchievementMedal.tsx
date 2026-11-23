import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { LOCKED_LOOK, getFamilyHue, getFamilyIcon, getRimFinish } from '../achievement-model';

interface AchievementMedalProps {
  category: string;
  /** 1..5 */
  tier: number;
  locked?: boolean;
  /** 0..1 arc drawn around a locked emblem to show how close it is. */
  progress?: number;
  size?: number;
}

const INK = '#0B0B10';

function mix(a: string, b: string, amount: number) {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const channel = (x: number, y: number) =>
    Math.round(x + (y - x) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`;
}

/** Pointy-top hexagon path starting at the top vertex, clockwise. */
export function hexPath(cx: number, cy: number, radius: number) {
  const points = Array.from({ length: 6 }, (_, k) => {
    const angle = ((-90 + 60 * k) * Math.PI) / 180;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M ${points.join(' L ')} Z`;
}

/** Four-point sparkle centred on (x, y). */
function sparklePath(x: number, y: number, r: number) {
  const k = r * 0.28;
  return `M ${x} ${y - r} L ${x + k} ${y - k} L ${x + r} ${y} L ${x + k} ${y + k} L ${x} ${y + r} L ${x - k} ${y + k} L ${x - r} ${y} L ${x - k} ${y - k} Z`;
}

/**
 * Faceted seal: a rounded hexagon whose colour belongs to the achievement family and whose rim
 * finish tells the tier (enamel → hue metal → champagne foil → foil + inlay → iridescent foil).
 * Glyphs are custom drawn. Locked seals go matte with a progress arc around the rim.
 */
export function AchievementMedal({
  category,
  tier,
  locked = false,
  progress = 0,
  size = 64,
}: AchievementMedalProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const hue = getFamilyHue(category);
  const finish = getRimFinish(tier, hue);

  const diskCenter = locked ? LOCKED_LOOK.disk[0] : mix(hue.deep, INK, 0.5);
  const diskEdge = locked ? LOCKED_LOOK.disk[1] : mix(hue.deep, INK, 0.86);
  const rimStops = locked ? LOCKED_LOOK.rim : finish.stops;

  const half = size / 2;
  const join = Math.max(2.4, size * 0.05);
  const outer = half - join / 2 - 0.5;
  const rim = Math.max(3, size * 0.085);
  const inner = outer - rim - join * 0.25;
  const arcRadius = outer - rim / 2;
  const perimeter = 6 * arcRadius;
  const showArc = locked && progress > 0;
  const glows = !locked && tier >= 3;
  const sparkles = !locked && tier >= 5;

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size * 0.28 },
        glows && {
          shadowColor: tier >= 5 ? '#F6DFA0' : hue.base,
          shadowOpacity: tier >= 4 ? 0.55 : 0.4,
          shadowRadius: size * 0.2,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
      ]}
      accessibilityElementsHidden
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`rim${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor={rimStops[0]} />
            <Stop offset="0.5" stopColor={rimStops[1]} />
            <Stop offset="1" stopColor={rimStops[2]} />
          </LinearGradient>
          <RadialGradient id={`disk${uid}`} cx="50%" cy="32%" r="78%">
            <Stop offset="0" stopColor={diskCenter} />
            <Stop offset="1" stopColor={diskEdge} />
          </RadialGradient>
          <LinearGradient id={`shine${uid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={locked ? 0.05 : 0.2} />
            <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id={`bevel${uid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={locked ? 0.1 : 0.4} />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.03} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.55} />
          </LinearGradient>
        </Defs>

        {/* rim */}
        <Path
          d={hexPath(half, half, outer)}
          fill={`url(#rim${uid})`}
          stroke={`url(#rim${uid})`}
          strokeWidth={join}
          strokeLinejoin="round"
        />
        {/* inlay line (tier 4+) */}
        {!locked && finish.inlay ? (
          <Path
            d={hexPath(half, half, outer - rim * 0.5)}
            fill="none"
            stroke={hue.base}
            strokeWidth={Math.max(1, size * 0.018)}
            strokeLinejoin="round"
            opacity={0.9}
          />
        ) : null}
        {/* disk */}
        <Path
          d={hexPath(half, half, inner)}
          fill={`url(#disk${uid})`}
          stroke={`url(#disk${uid})`}
          strokeWidth={join * 0.7}
          strokeLinejoin="round"
        />
        <Path
          d={hexPath(half, half, inner)}
          fill="none"
          stroke={`url(#bevel${uid})`}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <Path
          d={hexPath(half, half, inner * 0.92)}
          fill={`url(#shine${uid})`}
          stroke={`url(#shine${uid})`}
          strokeWidth={join * 0.5}
          strokeLinejoin="round"
        />

        {showArc ? (
          <Path
            d={hexPath(half, half, arcRadius)}
            fill="none"
            stroke={hue.base}
            strokeWidth={rim * 0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${perimeter} ${perimeter}`}
            strokeDashoffset={perimeter * (1 - Math.min(1, progress))}
          />
        ) : null}

        {sparkles ? (
          <>
            <Path
              d={sparklePath(size * 0.9, size * 0.14, size * 0.1)}
              fill="#FFFFFF"
              opacity={0.95}
            />
            <Path
              d={sparklePath(size * 0.1, size * 0.84, size * 0.07)}
              fill="#FFFFFF"
              opacity={0.75}
            />
          </>
        ) : null}
      </Svg>
      <View style={styles.glyph} pointerEvents="none">
        <MaterialCommunityIcons
          name={getFamilyIcon(category)}
          size={Math.round(size * 0.44)}
          color={locked ? LOCKED_LOOK.glyph : hue.light}
          style={
            locked
              ? undefined
              : {
                  textShadowColor: hue.base,
                  textShadowRadius: size * 0.14,
                  textShadowOffset: { width: 0, height: 0 },
                }
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
