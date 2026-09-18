import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3YourYear } from '../types';
import {
  formatMonthName,
  formatMonthYear,
  formatWeekdayName,
} from '../utils/insights-format';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsYourYearSectionProps {
  yourYear: InsightsV3YourYear;
  year: number;
}

export const InsightsYourYearSection = memo(function InsightsYourYearSection({
  yourYear,
  year,
}: InsightsYourYearSectionProps) {
  const maxTotal = useMemo(
    () => Math.max(...yourYear.months.map((month) => month.total), 1),
    [yourYear.months],
  );
  const hasActivity = yourYear.months.some((month) => month.total > 0);

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Your Year"
        subtitle={`How ${year} unfolded in your watch history`}
      />
      {!hasActivity ? (
        <InsightsEmptyState message="Your year will take shape as you watch and track titles." />
      ) : (
        <View style={styles.card}>
          <View style={styles.chart} accessibilityRole="summary">
            {yourYear.months.map((month) => {
              const heightPercent = Math.max(8, (month.total / maxTotal) * 100);
              return (
                <View key={month.month} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                  </View>
                  <AppText variant="caption" muted style={styles.monthLabel}>
                    {formatMonthName(month.month)}
                  </AppText>
                </View>
              );
            })}
          </View>
          <View style={styles.summaryRow}>
            <SummaryStat label="Active days" value={String(yourYear.activeDays)} />
            {yourYear.peakMonth ? (
              <SummaryStat
                label="Peak month"
                value={formatMonthYear(yourYear.peakMonth.month, yourYear.peakMonth.year)}
              />
            ) : null}
            {yourYear.favoriteWeekday != null ? (
              <SummaryStat
                label="Favorite weekday"
                value={formatWeekdayName(yourYear.favoriteWeekday)}
              />
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
});

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <AppText variant="caption" muted>{label}</AppText>
      <AppText variant="bodySmall" style={styles.summaryValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    minHeight: 120,
    paddingTop: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barTrack: {
    width: '100%',
    height: 96,
    justifyContent: 'flex-end',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.accent,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  monthLabel: {
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryStat: {
    gap: 2,
    minWidth: 96,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
