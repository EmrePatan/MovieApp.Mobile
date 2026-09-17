import { memo, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { InsightsActivity } from '../types';
import {
  formatWeekdayName,
  getActivityDayAccessibilityLabel,
  normalizeActivityDayState,
} from '../utils/insights-format';
import { getHeatmapCellBorderColor, getHeatmapCellColor } from '../utils/insights-heatmap-colors';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsYourYearSectionProps {
  activity: InsightsActivity;
}

const WEEKS = 52;
const ROWS = 7;
const CELL_GAP = 2;

export const InsightsYourYearSection = memo(function InsightsYourYearSection({
  activity,
}: InsightsYourYearSectionProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = spacing.lg * 2;
  const availableWidth = width - horizontalPadding - spacing.lg * 2;
  const cellSize = Math.max(4, Math.floor((availableWidth - CELL_GAP * (WEEKS - 1)) / WEEKS));

  const weeks = useMemo(() => {
    const grid: (InsightsActivity['days'][number] | null)[][] = Array.from({ length: WEEKS }, () =>
      Array.from({ length: ROWS }, () => null),
    );

    activity.days.forEach((day, index) => {
      const weekIndex = Math.floor(index / ROWS);
      const dayIndex = index % ROWS;
      if (weekIndex < WEEKS) {
        grid[weekIndex][dayIndex] = day;
      }
    });

    return grid;
  }, [activity.days]);

  const hasAnyActivity = activity.days.some(
    (day) => normalizeActivityDayState(day.state) === 'active',
  );

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Your Year"
        subtitle="Rolling 52-week watching activity"
      />
      {!hasAnyActivity ? (
        <InsightsEmptyState message="Your activity map will grow as you watch and track titles." />
      ) : (
        <View style={styles.card}>
          <View style={styles.heatmap} accessibilityRole="summary">
            {weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.weekColumn}>
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <View
                        key={`empty-${weekIndex}-${dayIndex}`}
                        style={[styles.cell, { width: cellSize, height: cellSize }]}
                      />
                    );
                  }

                  return (
                    <View
                      key={day.date}
                      style={[
                        styles.cell,
                        {
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: getHeatmapCellColor(day.state, day.intensityBucket),
                          borderColor: getHeatmapCellBorderColor(day.state),
                          borderWidth: getHeatmapCellBorderColor(day.state) ? 1 : 0,
                        },
                      ]}
                      accessibilityLabel={getActivityDayAccessibilityLabel(
                        day.date,
                        day.movies,
                        day.episodes,
                        day.state,
                        day.total,
                      )}
                    />
                  );
                })}
              </View>
            ))}
          </View>
          <View style={styles.summaryRow}>
            <SummaryStat label="Active days" value={String(activity.summary.totalActiveDays)} />
            {activity.summary.longestStreakDays != null ? (
              <SummaryStat
                label="Longest streak"
                value={`${activity.summary.longestStreakDays} days`}
              />
            ) : null}
            {activity.summary.mostActiveWeekday != null ? (
              <SummaryStat
                label="Most active day"
                value={formatWeekdayName(activity.summary.mostActiveWeekday)}
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  heatmap: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  weekColumn: {
    gap: CELL_GAP,
  },
  cell: {
    borderRadius: 2,
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
