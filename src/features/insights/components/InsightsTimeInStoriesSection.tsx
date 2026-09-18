import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3TimeInStories } from '../types';
import {
  formatEquivalentDays,
  formatEstimatedDuration,
  formatHoursFromMinutes,
} from '../utils/insights-format';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface InsightsTimeInStoriesSectionProps {
  timeInStories: InsightsV3TimeInStories;
  year: number;
}

export function InsightsTimeInStoriesSection({
  timeInStories,
  year,
}: InsightsTimeInStoriesSectionProps) {
  if (timeInStories.totalMinutes <= 0) {
    return (
      <View style={styles.section}>
        <InsightsSectionHeader
          title="Time in Stories"
          subtitle="Runtime across everything you've watched"
        />
        <InsightsEmptyState message="Runtime data will appear as you build your watch history." />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Time in Stories"
        subtitle="Runtime across everything you've watched"
      />
      <View style={styles.hero}>
        <AppText variant="caption" muted>All-time</AppText>
        <AppText variant="title" style={styles.hours}>
          {formatHoursFromMinutes(timeInStories.totalMinutes)} hours
        </AppText>
        <AppText variant="bodySmall" muted>
          About {formatEquivalentDays(timeInStories.totalMinutes)} of stories
        </AppText>
      </View>
      <View style={styles.breakdown}>
        <BreakdownItem label="Movies" value={formatEstimatedDuration(timeInStories.movieMinutes)} />
        <BreakdownItem label="Episodes" value={formatEstimatedDuration(timeInStories.episodeMinutes)} />
        {timeInStories.yearMinutes > 0 ? (
          <BreakdownItem
            label={`In ${year}`}
            value={formatEstimatedDuration(timeInStories.yearMinutes)}
          />
        ) : null}
      </View>
      {timeInStories.runtimeCoveragePercent > 0 ? (
        <AppText variant="caption" muted>
          Runtime coverage {Math.round(timeInStories.runtimeCoveragePercent)}%
        </AppText>
      ) : null}
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
  hero: {
    gap: 4,
  },
  hours: {
    color: colors.accentStrong,
  },
  breakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  breakdownItem: {
    gap: 2,
    minWidth: 88,
  },
  breakdownValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
