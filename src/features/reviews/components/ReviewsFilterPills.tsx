import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface ReviewsFilterPillsProps {
  selectedStars: number | null;
  onClearFilter: () => void;
}

export function ReviewsFilterPills({
  selectedStars,
  onClearFilter,
}: ReviewsFilterPillsProps) {
  const { t } = useTranslation();
  const isAllActive = selectedStars == null;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('reviews.filterAll')}
        accessibilityState={{ selected: isAllActive }}
        onPress={onClearFilter}
        style={({ pressed }) => [
          styles.pill,
          isAllActive && styles.pillActive,
          pressed && styles.pressed,
        ]}
        testID="reviews-filter-all"
      >
        <AppText
          variant="caption"
          style={[styles.pillLabel, isAllActive && styles.pillLabelActive]}
        >
          {t('reviews.filterAll')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
    minWidth: 0,
  },
  pill: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    minHeight: 32,
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
  },
  pillLabelActive: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
