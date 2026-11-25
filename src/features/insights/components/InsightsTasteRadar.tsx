import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Polygon, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { translateGenreName } from '@/i18n/catalog-labels';
import { colors } from '@/theme/colors';
import type { InsightsTasteGenre } from '../types';

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 72;
const LABEL_RADIUS = RADIUS + 20;
const RINGS = [0.33, 0.66, 1];

interface InsightsTasteRadarProps {
  genres: InsightsTasteGenre[];
}

// Side labels have ~70px before the card edge, so long genre names are cut.
function shortLabel(name: string) {
  return name.length > 13 ? `${name.slice(0, 12)}…` : name;
}

function pointAt(index: number, count: number, radius: number) {
  const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
  return { x: CENTER + Math.cos(angle) * radius, y: CENTER + Math.sin(angle) * radius };
}

/** Taste compass: one spoke per genre, the gold polygon grows toward the genres you watch most. */
export const InsightsTasteRadar = memo(function InsightsTasteRadar({
  genres,
}: InsightsTasteRadarProps) {
  const count = genres.length;
  if (count < 3) {
    return null;
  }

  const max = Math.max(...genres.map((genre) => genre.sharePercent), 1);
  const shape = genres.map((genre, index) =>
    pointAt(index, count, Math.max(0.12, genre.sharePercent / max) * RADIUS),
  );

  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <RadialGradient id="tasteFill" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ECD296" stopOpacity={0.5} />
            <Stop offset="100%" stopColor="#D4B36A" stopOpacity={0.18} />
          </RadialGradient>
        </Defs>
        {RINGS.map((ring) => (
          <Polygon
            key={ring}
            points={genres
              .map((_, index) => {
                const p = pointAt(index, count, RADIUS * ring);
                return `${p.x},${p.y}`;
              })
              .join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1}
          />
        ))}
        {genres.map((genre, index) => {
          const end = pointAt(index, count, RADIUS);
          return (
            <Line
              key={genre.genreId}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          );
        })}
        <Polygon
          points={shape.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="url(#tasteFill)"
          stroke="#ECD296"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {shape.map((p, index) => (
          <Circle
            key={genres[index].genreId}
            cx={p.x}
            cy={p.y}
            r={index === 0 ? 5 : 3.5}
            fill={index === 0 ? '#ECD296' : '#D4B36A'}
            stroke={colors.background}
            strokeWidth={1.5}
          />
        ))}
        <G>
          {genres.map((genre, index) => {
            const p = pointAt(index, count, LABEL_RADIUS);
            const anchor = Math.abs(p.x - CENTER) < 6 ? 'middle' : p.x > CENTER ? 'start' : 'end';
            return (
              <G key={genre.genreId}>
                <SvgText
                  x={p.x}
                  y={p.y + 2}
                  fontSize={11}
                  fontWeight={index === 0 ? '700' : '500'}
                  fill={index === 0 ? '#ECD296' : 'rgba(255,255,255,0.78)'}
                  textAnchor={anchor}
                >
                  {shortLabel(translateGenreName(genre.name))}
                </SvgText>
                <SvgText
                  x={p.x}
                  y={p.y + 15}
                  fontSize={10}
                  fill="rgba(255,255,255,0.45)"
                  textAnchor={anchor}
                >
                  {`${Math.round(genre.sharePercent)}%`}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    alignSelf: 'center',
  },
});
