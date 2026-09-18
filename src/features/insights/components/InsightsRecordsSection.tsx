import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3Records } from '../types';
import { formatAverageStarRating, formatWeekdayName } from '../utils/insights-format';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsRecordsSectionProps {
  records: InsightsV3Records;
  favoriteWeekday?: number | string | null;
}

export function InsightsRecordsSection({
  records,
  favoriteWeekday,
}: InsightsRecordsSectionProps) {
  const cards = [
    records.longestStreakDays != null
      ? {
          key: 'streak',
          icon: 'flame-outline' as const,
          value: String(records.longestStreakDays),
          caption: 'days',
          label: 'Longest watching streak',
        }
      : null,
    records.bestMovieWeek
      ? {
          key: 'movie-week',
          icon: 'film-outline' as const,
          value: String(records.bestMovieWeek.count),
          caption: 'movies',
          label: 'Most in one week',
        }
      : null,
    records.bestEpisodeWeek
      ? {
          key: 'episode-week',
          icon: 'tv-outline' as const,
          value: String(records.bestEpisodeWeek.count),
          caption: 'episodes',
          label: 'Biggest series week',
        }
      : null,
    records.highestRatingStars != null
      ? {
          key: 'rating',
          icon: 'star-outline' as const,
          value: formatAverageStarRating(records.highestRatingStars),
          caption: '/ 5',
          label: 'Highest rating',
        }
      : null,
  ].filter(Boolean);

  if (cards.length === 0) {
    return null;
  }

  const weekdayName = formatWeekdayName(favoriteWeekday);

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Records" subtitle="All-time personal bests" />
      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card!.key} style={styles.card} accessibilityRole="text">
            <View style={styles.iconBadge}>
              <Ionicons name={card!.icon} size={18} color={colors.accent} />
            </View>
            <View style={styles.valueRow}>
              <AppText variant="title" style={styles.value}>{card!.value}</AppText>
              <AppText variant="caption" muted>{card!.caption}</AppText>
            </View>
            <AppText variant="caption" muted style={styles.label}>{card!.label}</AppText>
          </View>
        ))}
      </View>
      {favoriteWeekday != null ? (
        <View style={styles.funFact}>
          <Ionicons name="bulb-outline" size={16} color={colors.accentMuted} />
          <AppText variant="bodySmall" muted style={styles.funFactText}>
            You&apos;re most active on {weekdayName}s.
          </AppText>
        </View>
      ) : null}
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
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 132,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    color: colors.accentStrong,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  label: {
    lineHeight: 16,
    color: colors.textMuted,
  },
  funFact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  funFactText: {
    flex: 1,
    lineHeight: 20,
  },
});
