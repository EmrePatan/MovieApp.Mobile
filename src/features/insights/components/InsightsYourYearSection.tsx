import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3YourYear } from '../types';
import {
  formatActiveYearDayPercent,
  formatMonthName,
  formatMonthYear,
  formatWeekdayName,
} from '../utils/insights-format';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { InsightsYearSelector } from './InsightsYearSelector';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsYourYearSectionProps {
  yourYear: InsightsV3YourYear;
  year: number;
  years: number[];
  onSelectYear: (year: number) => void;
}

export const InsightsYourYearSection = memo(function InsightsYourYearSection({
  yourYear,
  year,
  years,
  onSelectYear,
}: InsightsYourYearSectionProps) {
  const maxTotal = useMemo(
    () => Math.max(...yourYear.months.map((month) => month.total), 1),
    [yourYear.months],
  );
  const hasActivity = yourYear.months.some((month) => month.total > 0);
  const activeDayPercent = formatActiveYearDayPercent(yourYear.activeDays, year);
  const peakMonthNumber = yourYear.peakMonth?.month ?? null;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Your Year"
        trailing={
          years.length > 1 ? (
            <InsightsYearSelector
              years={years}
              selectedYear={year}
              onSelectYear={onSelectYear}
              compact
            />
          ) : (
            <AppText variant="caption" muted style={styles.yearBadge}>{year}</AppText>
          )
        }
      />
      {!hasActivity ? (
        <InsightsEmptyState message="Your year will take shape as you watch and track titles." />
      ) : (
        <View style={styles.body}>
          <View style={styles.chart} accessibilityRole="summary">
            {yourYear.months.map((month) => {
              const isPeak = peakMonthNumber === month.month;
              const heightPercent = Math.max(10, (month.total / maxTotal) * 100);
              return (
                <View key={month.month} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPercent}%` },
                        isPeak && styles.barFillPeak,
                      ]}
                    />
                  </View>
                  <AppText variant="caption" muted style={styles.monthLabel}>
                    {formatMonthName(month.month)}
                  </AppText>
                </View>
              );
            })}
          </View>

          <View style={styles.summaryRow}>
            <SummaryStat value={String(yourYear.activeDays)} label="active days" />
            {yourYear.peakMonth ? (
              <SummaryStat
                value={formatMonthYear(yourYear.peakMonth.month, yourYear.peakMonth.year)}
                label="peak month"
              />
            ) : null}
            {yourYear.favoriteWeekday != null ? (
              <SummaryStat
                value={formatWeekdayName(yourYear.favoriteWeekday)}
                label="favorite day"
              />
            ) : null}
          </View>

          {activeDayPercent != null ? (
            <View style={styles.callout} accessibilityRole="text">
              <Ionicons name="calendar-outline" size={16} color={colors.accent} />
              <AppText variant="bodySmall" style={styles.calloutText}>
                You watched something on {activeDayPercent}% of the days this year.
              </AppText>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
});

function SummaryStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryStat}>
      <AppText variant="body" style={styles.summaryValue}>{value}</AppText>
      <AppText variant="caption" muted>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  yearBadge: {
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  body: {
    gap: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 3,
    minHeight: 132,
    paddingTop: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barTrack: {
    width: '100%',
    height: 108,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.accentMuted,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
    minHeight: 8,
  },
  barFillPeak: {
    backgroundColor: colors.accent,
  },
  monthLabel: {
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  summaryStat: {
    gap: 2,
    minWidth: 88,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  calloutText: {
    flex: 1,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
