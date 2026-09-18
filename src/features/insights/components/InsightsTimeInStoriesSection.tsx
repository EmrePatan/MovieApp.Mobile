import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3TimeInStories } from '../types';
import {
  formatEquivalentDays,
  formatHoursFromMinutes,
  formatHoursShort,
} from '../utils/insights-format';
import { InsightsDonutRing } from './InsightsDonutRing';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

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
          subtitle="The hours you've spent in other worlds"
        />
        <InsightsEmptyState message="Runtime data will appear as you build your watch history." />
      </View>
    );
  }

  const movieSharePercent = Math.round(
    (timeInStories.movieMinutes / timeInStories.totalMinutes) * 100,
  );

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Time in Stories"
        subtitle="The hours you've spent in other worlds"
      />
      <LinearGradient
        colors={[colors.accentTint18, colors.surface, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.donutWrap}>
          <InsightsDonutRing size={168} strokeWidth={12} progressPercent={movieSharePercent} />
          <View style={styles.donutCenter}>
            <AppText variant="hero" style={styles.hours}>
              {formatHoursFromMinutes(timeInStories.totalMinutes)}
            </AppText>
            <AppText variant="caption" muted>hours</AppText>
            <AppText variant="bodySmall" muted style={styles.daysCopy}>
              That&apos;s {formatEquivalentDays(timeInStories.totalMinutes)} in stories
            </AppText>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.breakdownRow}>
        <BreakdownCard
          icon="film-outline"
          label="Movies"
          value={formatHoursShort(timeInStories.movieMinutes)}
        />
        <BreakdownCard
          icon="tv-outline"
          label="Series"
          value={formatHoursShort(timeInStories.episodeMinutes)}
        />
      </View>

      {timeInStories.yearMinutes > 0 ? (
        <View style={styles.yearLine}>
          <Ionicons name="time-outline" size={14} color={colors.accentMuted} />
          <AppText variant="caption" muted>
            In {year}, you&apos;ve watched {formatHoursFromMinutes(timeInStories.yearMinutes)} hours
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function BreakdownCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.breakdownCard}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <AppText variant="body" style={styles.breakdownValue}>{value}</AppText>
      <AppText variant="caption" muted>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  hero: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
  },
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 188,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.md,
  },
  hours: {
    color: colors.accentStrong,
    fontVariant: ['tabular-nums'],
  },
  daysCopy: {
    textAlign: 'center',
    marginTop: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  breakdownCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  breakdownValue: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  yearLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
});
