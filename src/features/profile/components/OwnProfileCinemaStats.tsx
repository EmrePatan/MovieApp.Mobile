import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
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

interface TileProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  unit: string;
  runtime: string;
}

function StatTile({ icon, value, unit, runtime }: TileProps) {
  return (
    <GlassSurface style={styles.tile}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.textPrimary} />
      </View>
      <View style={styles.copy}>
        <AppText style={styles.primary} numberOfLines={1}>
          {value}
          <AppText style={styles.unit}>{` ${unit}`}</AppText>
        </AppText>
        <AppText style={styles.runtime} numberOfLines={1}>
          {runtime}
        </AppText>
      </View>
    </GlassSurface>
  );
}

/** Two compact glass tiles: films and episodes watched, each with total runtime. */
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

  return (
    <View style={styles.row} accessibilityRole="summary">
      <StatTile
        icon="film-outline"
        value={formatCount(statistics.moviesWatched, i18n.language)}
        unit={t('social.movies').toLowerCase()}
        runtime={formatWatchDuration(statistics.movieRuntimeMinutes ?? 0, durationLabels)}
      />
      <StatTile
        icon="tv-outline"
        value={formatCount(statistics.episodesWatched, i18n.language)}
        unit={t('social.episodes').toLowerCase()}
        runtime={formatWatchDuration(statistics.episodeRuntimeMinutes ?? 0, durationLabels)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  tile: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  primary: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  runtime: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
});
