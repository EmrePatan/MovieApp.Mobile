import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { ReviewsSortControl } from './ReviewsSortControl';
import type { ReviewSortOption } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface ReviewsFeedHeaderProps {
  reviewCount: number;
  sort: ReviewSortOption;
  onSortChange: (value: ReviewSortOption) => void;
}

export function ReviewsFeedHeader({
  reviewCount,
  sort,
  onSortChange,
}: ReviewsFeedHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID="reviews-feed-header">
      <View style={styles.left} accessibilityRole="header">
        <AppText variant="caption" style={styles.sectionLabel}>
          {t('reviews.communityFeedLabel')}
        </AppText>
        <AppText variant="caption" style={styles.sectionCount} testID="reviews-feed-count">
          ({reviewCount})
        </AppText>
      </View>

      <ReviewsSortControl value={sort} onChange={onSortChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    minHeight: 40,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    minWidth: 0,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
  sectionCount: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
});
