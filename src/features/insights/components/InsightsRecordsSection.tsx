import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3Records } from '../types';
import { formatAverageStarRating, formatIsoWeekLabel } from '../utils/insights-format';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsRecordsSectionProps {
  records: InsightsV3Records;
}

export function InsightsRecordsSection({ records }: InsightsRecordsSectionProps) {
  const cards = [
    records.longestStreakDays != null
      ? {
          key: 'streak',
          icon: 'flame-outline' as const,
          label: 'Longest streak',
          value: `${records.longestStreakDays} days`,
        }
      : null,
    records.bestMovieWeek
      ? {
          key: 'movie-week',
          icon: 'film-outline' as const,
          label: 'Best movie week',
          value: `${records.bestMovieWeek.count} · ${formatIsoWeekLabel(records.bestMovieWeek.year, records.bestMovieWeek.week)}`,
        }
      : null,
    records.bestEpisodeWeek
      ? {
          key: 'episode-week',
          icon: 'tv-outline' as const,
          label: 'Best episode week',
          value: `${records.bestEpisodeWeek.count} · ${formatIsoWeekLabel(records.bestEpisodeWeek.year, records.bestEpisodeWeek.week)}`,
        }
      : null,
    records.highestRatingStars != null
      ? {
          key: 'rating',
          icon: 'star-outline' as const,
          label: 'Highest rating',
          value: `${formatAverageStarRating(records.highestRatingStars)}★`,
        }
      : null,
  ].filter(Boolean);

  if (cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Records" subtitle="All-time personal bests" />
      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card!.key} style={styles.card} accessibilityRole="text">
            <Ionicons name={card!.icon} size={16} color={colors.accent} />
            <AppText variant="caption" muted>{card!.label}</AppText>
            <AppText variant="bodySmall" style={styles.value}>{card!.value}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    minWidth: 148,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
