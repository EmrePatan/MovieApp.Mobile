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

interface ReviewAuthorRatingProps {
  userRating?: number | null;
}

export function ReviewAuthorRating({ userRating }: ReviewAuthorRatingProps) {
  const { t } = useTranslation();

  if (userRating == null || !isValidBackendScore(userRating)) {
    return null;
  }

  const stars = backendScoreToStarRating(userRating);
  const label = formatStarRatingDisplay(stars);

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={t('reviews.ratedOutOfFiveStars', { label })}
      testID="review-author-rating"
    >
      <Ionicons name="star" size={12} color={colors.accentStrong} />
      <AppText variant="caption" style={styles.label}>
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
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
  },
  label: {
    color: colors.accent,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
