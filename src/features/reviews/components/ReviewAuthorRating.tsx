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
  if (userRating == null || !isValidBackendScore(userRating)) {
    return null;
  }

  const stars = backendScoreToStarRating(userRating);

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Rated ${formatStarRatingDisplay(stars)} out of 5 stars`}
      testID="review-author-rating"
    >
      <Ionicons name="star" size={12} color={colors.accentStrong} />
      <AppText variant="caption" style={styles.label}>
        {formatStarRatingDisplay(stars)}
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
