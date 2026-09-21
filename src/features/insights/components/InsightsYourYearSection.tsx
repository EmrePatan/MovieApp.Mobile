import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3MonthlyActivity, InsightsV3YourYear } from '../types';
import {
  formatActiveYearDayPercentDisplay,
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
  const { t } = useTranslation();
  const maxTotal = useMemo(
    () => Math.max(...yourYear.months.map((month) => month.total), 1),
    [yourYear.months],
  );
  const hasActivity = yourYear.months.some((month) => month.total > 0);
  const activeDayPercent = formatActiveYearDayPercentDisplay(yourYear.activeDays, year);
  const peakMonthNumber = yourYear.peakMonth?.month ?? null;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title={t('insights.yourYear.title')}
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
        <InsightsEmptyState message={t('insights.yourYear.empty')} />
      ) : (
        <View style={styles.body}>
          <View style={styles.chart} accessibilityRole="summary">
            {yourYear.months.map((month) => (
              <MonthlyStackedBar
                key={month.month}
                month={month}
                maxTotal={maxTotal}
                isPeak={peakMonthNumber === month.month}
              />
            ))}
          </View>

          <View style={styles.legend} accessibilityRole="text">
            <LegendItem color={colors.accentMuted} label={t('insights.yourYear.legendMovies')} />
            <LegendItem color={colors.accentStrong} label={t('insights.yourYear.legendEpisodes')} />
          </View>

          <View style={styles.summaryRow}>
            <SummaryStat value={String(yourYear.activeDays)} label={t('insights.yourYear.activeDays')} accent />
            {yourYear.peakMonth ? (
              <SummaryStat
                value={formatMonthYear(yourYear.peakMonth.month, yourYear.peakMonth.year)}
                label={t('insights.yourYear.peakMonth')}
                accent
              />
            ) : null}
            {yourYear.favoriteWeekday != null ? (
              <SummaryStat
                value={formatWeekdayName(yourYear.favoriteWeekday)}
                label={t('insights.yourYear.favoriteDay')}
                accent
              />
            ) : null}
          </View>

          {activeDayPercent != null ? (
            <View style={styles.callout} accessibilityRole="text">
              <Ionicons name="calendar-outline" size={16} color={colors.accent} />
              <AppText variant="bodySmall" style={styles.calloutText}>
                {activeDayPercent.kind === 'under-one'
                  ? t('insights.yourYear.activeDayCalloutUnderOne')
                  : t('insights.yourYear.activeDayCallout', { percent: activeDayPercent.value })}
              </AppText>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
});

function MonthlyStackedBar({
  month,
  maxTotal,
  isPeak,
}: {
  month: InsightsV3MonthlyActivity;
  maxTotal: number;
  isPeak: boolean;
}) {
  const { t } = useTranslation();
  const { total, movies, episodes } = month;
  const barHeightPercent = total === 0 ? 0 : Math.max(10, (total / maxTotal) * 100);
  const moviesShare = total > 0 ? (movies / total) * 100 : 0;
  const episodesShare = total > 0 ? (episodes / total) * 100 : 0;
  const monthLabel = formatMonthName(month.month);

  return (
    <View
      style={styles.barColumn}
      accessibilityLabel={
        total === 0
          ? t('insights.yourYear.monthAccessibilityEmpty', { month: monthLabel })
          : t('insights.yourYear.monthAccessibility', {
              month: monthLabel,
              movies,
              episodes,
            })
      }
    >
      <View style={styles.barTrack}>
        {total > 0 ? (
          <View style={[styles.barStack, { height: `${barHeightPercent}%` }]}>
            {episodes > 0 ? (
              <View
                style={[
                  styles.barSegment,
                  { height: `${episodesShare}%` },
                  isPeak ? styles.barSegmentEpisodesPeak : styles.barSegmentEpisodesBase,
                  movies === 0 && styles.barSegmentTop,
                ]}
              />
            ) : null}
            {movies > 0 ? (
              <View
                style={[
                  styles.barSegment,
                  { height: `${moviesShare}%` },
                  isPeak ? styles.barSegmentMoviesPeak : styles.barSegmentMoviesBase,
                  episodes === 0 && styles.barSegmentTop,
                ]}
              />
            ) : null}
          </View>
        ) : null}
      </View>
      <AppText
        variant="caption"
        muted={!isPeak}
        style={[styles.monthLabel, isPeak && styles.monthLabelPeak]}
      >
        {monthLabel}
      </AppText>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <AppText variant="caption" style={styles.legendLabel}>{label}</AppText>
    </View>
  );
}

function SummaryStat({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.summaryStat}>
      <AppText variant="subtitle" style={[styles.summaryValue, accent && styles.summaryValueAccent]}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.summaryLabel}>{label}</AppText>
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
  barStack: {
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  barSegment: {
    width: '100%',
  },
  barSegmentTop: {
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  barSegmentMoviesBase: {
    backgroundColor: colors.accentTint18,
  },
  barSegmentMoviesPeak: {
    backgroundColor: colors.accentMuted,
  },
  barSegmentEpisodesBase: {
    backgroundColor: colors.progressTrack,
  },
  barSegmentEpisodesPeak: {
    backgroundColor: colors.accentStrong,
  },
  monthLabel: {
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  monthLabelPeak: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    color: colors.textMuted,
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
    letterSpacing: -0.2,
  },
  summaryValueAccent: {
    color: colors.accentStrong,
  },
  summaryLabel: {
    color: colors.textMuted,
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  calloutText: {
    flex: 1,
    color: colors.textMuted,
    lineHeight: 20,
  },
  calloutHighlight: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
