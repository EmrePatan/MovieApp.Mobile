import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReviewsRatingFilterControl } from './ReviewsRatingFilterControl';
import { ReviewsSortChips } from './ReviewsSortChips';
import type { ReviewSortOption } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface ReviewsFeedHeaderProps {
  filteredReviewCount: number;
  sort: ReviewSortOption;
  selectedStars: number | null;
  onSortChange: (value: ReviewSortOption) => void;
  onRatingStarsChange: (stars: number | null) => void;
}

export function ReviewsFeedHeader({
  filteredReviewCount,
  sort,
  selectedStars,
  onSortChange,
  onRatingStarsChange,
}: ReviewsFeedHeaderProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      testID="reviews-feed-header"
    >
      <View style={styles.row}>
        <ReviewsRatingFilterControl
          selectedStars={selectedStars}
          filteredReviewCount={filteredReviewCount}
          onSelectStars={onRatingStarsChange}
        />
        <View
          style={styles.sortLead}
          accessibilityLabel={t('common.sortBy')}
          accessibilityRole="image"
          testID="reviews-sort-icon"
        >
          <Ionicons name="swap-vertical-outline" size={16} color={colors.textMuted} />
        </View>
        <ReviewsSortChips value={sort} onChange={onSortChange} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'nowrap',
  },
  sortLead: {
    width: 24,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
