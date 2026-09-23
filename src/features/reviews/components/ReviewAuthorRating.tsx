import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import {
  backendScoreToStarRating,
  formatStarRatingDisplay,
  isValidBackendScore,
} from '@/features/ratings/utils/star-rating';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

type ReviewAuthorRatingVariant = 'pill' | 'inline';
type ReviewAuthorRatingSize = 'sm' | 'md';

interface ReviewAuthorRatingProps {
  userRating?: number | null;
  variant?: ReviewAuthorRatingVariant;
  size?: ReviewAuthorRatingSize;
}

export function ReviewAuthorRating({
  userRating,
  variant = 'pill',
  size = 'sm',
}: ReviewAuthorRatingProps) {
  const { t } = useTranslation();

  if (userRating == null || !isValidBackendScore(userRating)) {
    return null;
  }

  const stars = backendScoreToStarRating(userRating);
  const label = formatStarRatingDisplay(stars);
  const iconSize = size === 'md' ? 14 : 12;
  const isInline = variant === 'inline';

  return (
    <View
      style={[
        styles.container,
        isInline ? styles.containerInline : styles.containerPill,
        size === 'md' && styles.containerMd,
      ]}
      accessibilityRole="text"
      accessibilityLabel={t('reviews.ratedOutOfFiveStars', { label })}
      testID="review-author-rating"
    >
      <Ionicons name="star" size={iconSize} color={colors.accentStrong} />
      <AppText
        variant="caption"
        style={[styles.label, size === 'md' && styles.labelMd, isInline && styles.labelInline]}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  containerPill: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
  },
  containerInline: {
    flexShrink: 0,
  },
  containerMd: {
    gap: 4,
    marginTop: 1,
    marginBottom: 2,
  },
  label: {
    color: colors.accent,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    fontSize: 11,
    lineHeight: 14,
  },
  labelMd: {
    fontSize: 14,
    lineHeight: 18,
  },
  labelInline: {
    color: colors.accentStrong,
  },
});
