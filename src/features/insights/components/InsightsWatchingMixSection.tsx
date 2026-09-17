import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { InsightsWatchingMix } from '../types';
import { getWatchingMixPercentages } from '../utils/insights-format';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsWatchingMixSectionProps {
  watchingMix: InsightsWatchingMix;
}

export function InsightsWatchingMixSection({ watchingMix }: InsightsWatchingMixSectionProps) {
  const total = watchingMix.movieTitleCount + watchingMix.seriesTitleCount;
  const { moviePercent, seriesPercent } = getWatchingMixPercentages(
    watchingMix.movieTitleCount,
    watchingMix.seriesTitleCount,
  );

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Movies vs Series"
        subtitle="Unique movies watched vs TV series started"
      />
      {total === 0 ? (
        <InsightsEmptyState message="No watching history yet." />
      ) : (
        <View
          style={styles.card}
          accessibilityRole="text"
          accessibilityLabel={`Movies ${watchingMix.movieTitleCount}, series ${watchingMix.seriesTitleCount}`}
        >
          <View style={styles.splitTrack}>
            <View style={[styles.movieFill, { flex: moviePercent }]} />
            <View style={[styles.seriesFill, { flex: seriesPercent }]} />
          </View>
          <View style={styles.legend}>
            <LegendItem
              label="Movies"
              count={watchingMix.movieTitleCount}
              percent={moviePercent}
              color={colors.accent}
            />
            <LegendItem
              label="Series"
              count={watchingMix.seriesTitleCount}
              percent={seriesPercent}
              color={colors.libraryWatching}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function LegendItem({
  label,
  count,
  percent,
  color,
}: {
  label: string;
  count: number;
  percent: number;
  color: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View>
        <AppText variant="bodySmall" style={styles.legendLabel}>{label}</AppText>
        <AppText variant="caption" muted>
          {count} titles · {percent}%
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  splitTrack: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.progressTrack,
  },
  movieFill: {
    backgroundColor: colors.accent,
    minWidth: 4,
  },
  seriesFill: {
    backgroundColor: colors.libraryWatching,
    minWidth: 4,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
