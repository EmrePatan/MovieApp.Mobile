import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { UserStatisticsActivityResponse } from '../types';
import {
  formatMonthDetailLabel,
  formatMonthLabel,
  getMonthAccessibilityLabel,
  getPreviousMonthComparison,
} from '../utils/profile-analytics';
import { ProfileEmptyInsight } from './ProfileEmptyInsight';
import { ProfileSectionHeader } from './ProfileSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface ProfileYourYearSectionProps {
  activity: UserStatisticsActivityResponse;
}

export function ProfileYourYearSection({ activity }: ProfileYourYearSectionProps) {
  const { t } = useTranslation();
  const [chartWidth, setChartWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const months = activity.last12Months;
  const maxTotal = Math.max(...months.map((month) => month.total), 1);
  const hasActivity = months.some((month) => month.total > 0);
  const selectedMonth =
    selectedIndex === null ? null : months[selectedIndex] ?? null;
  const monthComparison = getPreviousMonthComparison(activity);

  const barWidth = useMemo(() => {
    if (chartWidth <= 0) {
      return 0;
    }

    const gapTotal = spacing.xs * (months.length - 1);
    return Math.max(8, (chartWidth - gapTotal) / months.length);
  }, [chartWidth, months.length]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  if (!hasActivity) {
    return (
      <View style={styles.section}>
        <ProfileSectionHeader
          title={t('profile.preview.yourYearTitle')}
          subtitle={t('profile.preview.yourYearSubtitle')}
        />
        <ProfileEmptyInsight message={t('profile.preview.yourYearEmpty')} />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <ProfileSectionHeader
        title={t('profile.preview.yourYearTitle')}
        subtitle={t('profile.preview.yourYearSubtitle')}
      />
      <View style={styles.card}>
        <View style={styles.chart} onLayout={handleLayout}>
          {months.map((month, index) => {
            const height = Math.max(6, (month.total / maxTotal) * 120);
            const isSelected = selectedIndex === index;
            const isCurrent = index === months.length - 1;

            return (
              <Pressable
                key={`${month.year}-${month.month}`}
                accessibilityRole="button"
                accessibilityLabel={getMonthAccessibilityLabel(month)}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedIndex(index)}
                style={({ pressed }) => [
                  styles.barColumn,
                  { width: barWidth },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor: isSelected || isCurrent
                          ? colors.accent
                          : colors.accentTint18,
                      },
                    ]}
                  />
                </View>
                <AppText variant="caption" muted style={styles.monthLabel}>
                  {formatMonthLabel(month.month, month.year)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {selectedMonth ? (
          <View style={styles.detail} accessibilityRole="text">
            <AppText variant="bodySmall" style={styles.detailTitle}>
              {formatMonthDetailLabel(selectedMonth.month, selectedMonth.year)}
            </AppText>
            <AppText variant="caption" muted>
              {t('profile.preview.monthDetail', {
                total: selectedMonth.total,
                movies: selectedMonth.movies,
                episodes: selectedMonth.episodes,
              })}
            </AppText>
          </View>
        ) : null}

        <View style={styles.insights}>
          {activity.mostActiveMonth ? (
            <InsightRow
              label={t('profile.preview.mostActiveMonth')}
              value={t('profile.preview.mostActiveMonthValue', {
                month: formatMonthLabel(
                  activity.mostActiveMonth.month,
                  activity.mostActiveMonth.year,
                ),
                total: activity.mostActiveMonth.total,
              })}
            />
          ) : null}
          {activity.longestStreakDays ? (
            <InsightRow
              label={t('profile.preview.longestStreak')}
              value={t('profile.preview.longestStreakValue', {
                days: activity.longestStreakDays,
              })}
            />
          ) : null}
          <InsightRow
            label={t('profile.preview.currentMonth')}
            value={t('profile.preview.currentMonthValue', {
              total: activity.currentMonthTotal,
            })}
          />
          {monthComparison !== null ? (
            <InsightRow
              label={t('profile.preview.previousMonthComparison')}
              value={`${monthComparison > 0 ? '+' : ''}${monthComparison}%`}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.insightRow}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText variant="bodySmall" style={styles.insightValue}>
        {value}
      </AppText>
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
    padding: spacing.sm,
    gap: spacing.sm,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    minHeight: 148,
  },
  barColumn: {
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 148,
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: borderRadius.sm,
    minHeight: 6,
  },
  monthLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detail: {
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 2,
  },
  detailTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  insights: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  insightValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
