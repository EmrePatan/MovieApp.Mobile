import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3TimeInStories } from '../types';
import { formatWatchTimeBreakdown } from '../utils/insights-format';
import { resolveImageUri } from '@/utils/image-url';
import { InsightsDonutRing } from './InsightsDonutRing';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsTimeInStoriesSectionProps {
  timeInStories: InsightsV3TimeInStories;
  year: number;
  backdropImagePath?: string | null;
}

export function InsightsTimeInStoriesSection({
  timeInStories,
  year,
  backdropImagePath,
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
  const totalBreakdown = formatWatchTimeBreakdown(timeInStories.totalMinutes);
  const resolvedBackdrop = resolveImageUri(backdropImagePath, 'w500');

  return (
    <View style={styles.section}>
      <InsightsSectionHeader
        title="Time in Stories"
        subtitle="The hours you've spent in other worlds"
      />
      <View style={styles.hero}>
        <View style={styles.donutWrap}>
          {resolvedBackdrop ? (
            <View style={styles.donutPhotoClip}>
              <Image source={{ uri: resolvedBackdrop }} style={styles.donutPhoto} />
              <LinearGradient
                colors={['rgba(10, 10, 15, 0.35)', 'rgba(10, 10, 15, 0.88)']}
                style={styles.donutPhotoScrim}
              />
            </View>
          ) : null}
          <InsightsDonutRing size={176} strokeWidth={13} progressPercent={movieSharePercent} />
          <View style={styles.donutCenter}>
            <AppText variant="hero" center style={styles.duration} numberOfLines={2}>
              {totalBreakdown}
            </AppText>
            <AppText variant="caption" style={styles.durationLabel}>watch time</AppText>
          </View>
        </View>
      </View>

      <View style={styles.breakdownRow}>
        <BreakdownCard
          icon="film-outline"
          label="Movies"
          value={formatWatchTimeBreakdown(timeInStories.movieMinutes)}
        />
        <BreakdownCard
          icon="tv-outline"
          label="Series"
          value={formatWatchTimeBreakdown(timeInStories.episodeMinutes)}
        />
      </View>

      {timeInStories.yearMinutes > 0 ? (
        <View style={styles.yearLine}>
          <Ionicons name="time-outline" size={14} color={colors.accentMuted} />
          <AppText variant="caption" muted>
            In {year}, you&apos;ve watched{' '}
            <AppText variant="caption" style={styles.yearHighlight}>
              {formatWatchTimeBreakdown(timeInStories.yearMinutes)}
            </AppText>
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
      <AppText variant="body" center style={styles.breakdownValue} numberOfLines={2}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.breakdownLabel}>{label}</AppText>
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
    backgroundColor: colors.surface,
  },
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 196,
  },
  donutPhotoClip: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    overflow: 'hidden',
  },
  donutPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  donutPhotoScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.md,
    maxWidth: 148,
  },
  duration: {
    color: colors.accentStrong,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 32,
  },
  durationLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
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
  },
  breakdownValue: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    fontSize: 15,
    lineHeight: 20,
  },
  breakdownLabel: {
    color: colors.textMuted,
  },
  yearLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  yearHighlight: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
});
