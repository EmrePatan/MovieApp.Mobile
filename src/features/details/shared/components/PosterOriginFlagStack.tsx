import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CircularFlagBadge } from '@/components/common/CircularFlagBadge';
import { resolveOriginCountries } from '../utils/origin-country-display';
import { shadows } from '@/theme/shadows';
import { borderRadius, spacing } from '@/theme/spacing';

type PosterOriginFlagAnchor = 'topLeft' | 'bottomLeft';

interface PosterOriginFlagStackProps {
  countryCodes: readonly string[] | null | undefined;
  anchor?: PosterOriginFlagAnchor;
}

export const PosterOriginFlagStack = memo(function PosterOriginFlagStack({
  countryCodes,
  anchor = 'bottomLeft',
}: PosterOriginFlagStackProps) {
  const flags = useMemo(() => resolveOriginCountries(countryCodes), [countryCodes]);
  const stackStyle = anchor === 'topLeft' ? styles.stackTopLeft : styles.stackBottomLeft;

  if (flags.length === 0) {
    return null;
  }

  const accessibilityLabel = flags.map((flag) => flag.label).join(', ');

  return (
    <View
      style={[styles.stack, stackStyle]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      pointerEvents="none"
      testID="poster-origin-flag-stack"
    >
      {flags.map((flag) => (
        <View key={flag.code} style={styles.flagFrame}>
          <CircularFlagBadge emoji={flag.emoji} size="compact" surface="poster" />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    position: 'absolute',
    gap: spacing.xs,
    alignItems: 'flex-start',
    zIndex: 2,
  },
  stackTopLeft: {
    top: spacing.sm,
    left: spacing.sm,
  },
  stackBottomLeft: {
    bottom: spacing.sm,
    left: spacing.sm,
  },
  flagFrame: {
    ...shadows.poster,
    borderRadius: borderRadius.full,
  },
});
