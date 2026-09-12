import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { UserStatisticsResponse } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileStatisticsGridProps {
  statistics: UserStatisticsResponse;
}

interface StatItem {
  label: string;
  value: number;
}

function buildStatItems(statistics: UserStatisticsResponse): StatItem[] {
  return [
    { label: 'Watched', value: statistics.totalWatchedCount },
    { label: 'Movies watched', value: statistics.watchedMovieCount },
    { label: 'Episodes watched', value: statistics.watchedEpisodeCount },
    {
      label: 'Favorites',
      value: statistics.favoriteMovieCount + statistics.favoriteTvShowCount,
    },
    { label: 'Watchlists', value: statistics.watchlistCount },
    { label: 'Watchlist items', value: statistics.watchlistItemCount },
    { label: 'Ratings', value: statistics.totalRatingCount },
    { label: 'Reviews', value: statistics.totalReviewCount },
  ];
}

export function ProfileStatisticsGrid({ statistics }: ProfileStatisticsGridProps) {
  const items = buildStatItems(statistics);

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.card} accessibilityRole="text">
          <AppText variant="title">{item.value}</AppText>
          <AppText variant="caption" muted>
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
});
