import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { ReviewsSortControl } from './ReviewsSortControl';
import { ReviewsFilterPills } from './ReviewsFilterPills';
import type { ReviewSortOption } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface ReviewsFeedHeaderProps {
  reviewCount: number;
  sort: ReviewSortOption;
  selectedStars: number | null;
  onSortChange: (value: ReviewSortOption) => void;
  onClearFilter: () => void;
}

export function ReviewsFeedHeader({
  reviewCount,
  sort,
  selectedStars,
  onSortChange,
  onClearFilter,
}: ReviewsFeedHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionRow} accessibilityRole="header">
        <AppText variant="caption" style={styles.sectionLabel}>
          {t('reviews.communityFeedLabel')}
        </AppText>
        <AppText variant="caption" style={styles.sectionCount} testID="reviews-feed-count">
          ({reviewCount})
        </AppText>
      </View>

      <View style={styles.container} testID="reviews-feed-header">
        <ReviewsFilterPills
          selectedStars={selectedStars}
          onClearFilter={onClearFilter}
        />

        <ReviewsSortControl value={sort} onChange={onSortChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
  sectionCount: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    minHeight: 40,
  },
});
