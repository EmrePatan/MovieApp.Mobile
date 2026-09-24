import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface ReviewsRatingFilterControlProps {
  selectedStars: number | null;
  filteredReviewCount: number;
  onSelectStars: (stars: number | null) => void;
}

export function ReviewsRatingFilterControl({
  selectedStars,
  filteredReviewCount,
  onSelectStars,
}: ReviewsRatingFilterControlProps) {
  const { t } = useTranslation();

  if (selectedStars == null) {
    return null;
  }

  const label = t('reviews.filterStarChip', {
    stars: selectedStars,
    count: filteredReviewCount,
  });

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('reviews.clearStarFilter', { stars: selectedStars })}
        onPress={() => onSelectStars(null)}
        style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
        testID="reviews-filter-star-chip"
      >
        <AppText variant="caption" style={styles.label} numberOfLines={1}>
          {label}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  chip: {
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
