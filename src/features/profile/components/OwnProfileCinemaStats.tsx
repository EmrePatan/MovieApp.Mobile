import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { SocialProfileStatistics } from '@/features/social/types';
import { formatWatchDuration } from '@/features/social/utils/format-watch-duration';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface OwnProfileCinemaStatsProps {
  statistics: SocialProfileStatistics;
}

function formatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Flat watch ledger under identity — no card chrome.
 * Two columns (film / dizi), same type language as followers meta.
 */
export function OwnProfileCinemaStats({ statistics }: OwnProfileCinemaStatsProps) {
  const { t, i18n } = useTranslation();
  const durationLabels = useMemo(
    () => ({
      minutes: (count: number) => t('social.durationMinutes', { count }),
      hours: (count: number) => t('social.durationHours', { count }),
      hoursMinutes: (hours: number, minutes: number) =>
        t('social.durationHoursMinutes', { hours, minutes }),
      days: (count: number) => t('social.durationDays', { count }),
      daysHours: (days: number, hours: number) => t('social.durationDaysHours', { days, hours }),
    }),
    [t],
  );

  const movieCount = formatCount(statistics.moviesWatched, i18n.language);
  const episodeCount = formatCount(statistics.episodesWatched, i18n.language);
  const movieRuntime = formatWatchDuration(statistics.movieRuntimeMinutes ?? 0, durationLabels);
  const showRuntime = formatWatchDuration(statistics.episodeRuntimeMinutes ?? 0, durationLabels);

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.filmColumn}>
        <Ionicons name="film-outline" size={26} color={colors.textMuted} style={styles.icon} />
        <View style={styles.copy}>
          <AppText style={styles.heading} numberOfLines={1}>
            {t('social.movies')}
          </AppText>
          <AppText style={styles.line}>
            <AppText style={styles.number}>{movieCount}</AppText>
            <AppText style={styles.muted}>{` · ${movieRuntime}`}</AppText>
          </AppText>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.tvColumn}>
        <Ionicons name="tv-outline" size={26} color={colors.textMuted} style={styles.icon} />
        <View style={styles.copy}>
          <AppText style={styles.heading} numberOfLines={1}>
            {t('common.tv')}
          </AppText>
          <AppText style={styles.line}>
            <AppText style={styles.number}>{episodeCount}</AppText>
            <AppText style={styles.muted}>{` ${t('social.episodes').toLowerCase()} · ${showRuntime}`}</AppText>
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  filmColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  tvColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  icon: {
    marginTop: 1,
  },
  copy: {
    gap: 2,
    flexShrink: 1,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.borderSubtle,
    marginVertical: 2,
  },
  heading: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  line: {
    fontSize: 13,
    lineHeight: 18,
  },
  number: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
