import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { UserStatisticsSummaryResponse } from '../types';
import { formatAverageRating } from '../utils/profile-analytics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ProfileHeroStatsProps {
  summary: UserStatisticsSummaryResponse;
}

export function ProfileHeroStats({ summary }: ProfileHeroStatsProps) {
  const watchedTotal = summary.moviesWatched + summary.episodesWatched;

  return (
    <View style={styles.container} accessibilityRole="summary">
      <StatItem label="Watched" value={String(watchedTotal)} />
      <View style={styles.divider} />
      <StatItem label="Ratings" value={String(summary.ratingsCount)} />
      <View style={styles.divider} />
      <StatItem
        label="Average"
        value={formatAverageRating(summary.averageStarRating)}
      />
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.item} accessibilityRole="text">
      <AppText variant="title" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" muted style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
});
