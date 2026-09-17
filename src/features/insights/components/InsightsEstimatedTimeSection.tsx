import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { InsightsEstimatedTimeWatched } from '../types';
import { formatEstimatedDuration } from '../utils/insights-format';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsEstimatedTimeSectionProps {
  estimatedTime: InsightsEstimatedTimeWatched;
}

export function InsightsEstimatedTimeSection({
  estimatedTime,
}: InsightsEstimatedTimeSectionProps) {
  const hasRuntimeData = estimatedTime.knownRuntimeItemCount > 0;
  const coverage = estimatedTime.coveragePercent;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Estimated time watched"
        subtitle="Based on catalog runtimes, not playback time"
      />
      {!hasRuntimeData ? (
        <InsightsEmptyState message="Runtime data is not available for your watched titles yet." />
      ) : (
        <View style={styles.card}>
          <AppText variant="title" style={styles.total}>
            {formatEstimatedDuration(estimatedTime.totalEstimatedMinutes)}
          </AppText>
          <View style={styles.breakdown}>
            <BreakdownItem
              label="Movies"
              value={formatEstimatedDuration(estimatedTime.movieEstimatedMinutes)}
            />
            <BreakdownItem
              label="Episodes"
              value={formatEstimatedDuration(estimatedTime.episodeEstimatedMinutes)}
            />
          </View>
          <AppText variant="caption" muted>
            {estimatedTime.knownRuntimeItemCount} of {estimatedTime.totalWatchedItemCount} watched
            items have known runtimes ({Math.round(coverage)}% coverage).
          </AppText>
          {coverage < 50 ? (
            <AppText variant="caption" style={styles.lowCoverage}>
              Coverage is limited, so this estimate may change as more runtime data becomes available.
            </AppText>
          ) : coverage < 80 ? (
            <AppText variant="caption" muted>
              Some watched titles are still missing runtime metadata.
            </AppText>
          ) : null}
        </View>
      )}
    </View>
  );
}

function BreakdownItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.breakdownItem}>
      <AppText variant="caption" muted>{label}</AppText>
      <AppText variant="bodySmall" style={styles.breakdownValue}>{value}</AppText>
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
    gap: spacing.sm,
  },
  total: {
    color: colors.textPrimary,
  },
  breakdown: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  breakdownItem: {
    gap: 2,
  },
  breakdownValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  lowCoverage: {
    color: colors.warning,
  },
});
