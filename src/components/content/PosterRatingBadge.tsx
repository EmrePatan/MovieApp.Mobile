import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { formatRating } from '@/utils/format';

const SCRIM_HEIGHT = 56;

interface PosterRatingBadgeProps {
  voteAverage: number;
  /** Rendered poster height; the badge is pinned to the poster's bottom-left corner. */
  posterHeight: number;
}

/**
 * Glass rating chip over a soft bottom scrim. The tone follows the score:
 * 8+ gold-filled, 7+ gold-rimmed, below that plain.
 */
export function PosterRatingBadge({ voteAverage, posterHeight }: PosterRatingBadgeProps) {
  if (!(voteAverage > 0)) return null;
  const tone = voteAverage >= 8 ? 'top' : voteAverage >= 7 ? 'good' : 'plain';

  return (
    <View
      style={[styles.anchor, { top: Math.max(0, posterHeight - SCRIM_HEIGHT) }]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['rgba(10,10,15,0)', 'rgba(10,10,15,0.78)']}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[styles.chip, tone === 'good' && styles.chipGood, tone === 'top' && styles.chipTop]}
      >
        <Ionicons
          name="star"
          size={10}
          color={tone === 'plain' ? colors.textSecondary : colors.accentStrong}
        />
        <AppText style={[styles.text, tone !== 'plain' && styles.textAccent]}>
          {formatRating(voteAverage)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCRIM_HEIGHT,
    zIndex: 3,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: spacing.xs + 2,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    overflow: 'hidden',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(10, 10, 15, 0.62)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  chipGood: {
    borderColor: 'rgba(236, 210, 150, 0.45)',
  },
  chipTop: {
    backgroundColor: 'rgba(212, 179, 106, 0.28)',
    borderColor: 'rgba(236, 210, 150, 0.8)',
  },
  text: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  textAccent: {
    color: colors.textPrimary,
  },
});
