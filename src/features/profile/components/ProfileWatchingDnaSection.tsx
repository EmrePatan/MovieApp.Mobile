import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { UserStatisticsResponse } from '../types';
import { getWatchingMixPercentages } from '../utils/profile-analytics';
import { ProfileEmptyInsight } from './ProfileEmptyInsight';
import { ProfileSectionHeader } from './ProfileSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileWatchingDnaSectionProps {
  statistics: UserStatisticsResponse;
}

export function ProfileWatchingDnaSection({ statistics }: ProfileWatchingDnaSectionProps) {
  const { t } = useTranslation();
  const totalTitles =
    statistics.watchingMix.movieTitleCount + statistics.watchingMix.seriesTitleCount;

  if (totalTitles === 0) {
    return (
      <View style={styles.section}>
        <ProfileSectionHeader
          title={t('profile.preview.watchingDnaTitle')}
          subtitle={t('profile.preview.watchingDnaSubtitle')}
        />
        <ProfileEmptyInsight message={t('profile.preview.watchingDnaEmpty')} />
      </View>
    );
  }

  const { moviePercent, tvPercent } = getWatchingMixPercentages(statistics);
  const completionRatio =
    statistics.summary.showsStarted > 0
      ? Math.round((statistics.summary.showsCompleted / statistics.summary.showsStarted) * 100)
      : null;

  return (
    <View style={styles.section}>
      <ProfileSectionHeader
        title={t('profile.preview.watchingDnaTitle')}
        subtitle={t('profile.preview.watchingDnaSubtitle')}
      />
      <View
        style={styles.card}
        accessibilityLabel={t('profile.preview.watchingDnaAccessibility', {
          moviePercent,
          tvPercent,
        })}
      >
        <View style={styles.splitTrack}>
          <View style={[styles.movieFill, { width: `${moviePercent}%` }]} />
          <View style={[styles.tvFill, { width: `${tvPercent}%` }]} />
        </View>
        <View style={styles.splitLabels}>
          <AppText variant="bodySmall" style={styles.splitLabel}>
            {t('profile.preview.moviesPercent', { percent: moviePercent })}
          </AppText>
          <AppText variant="bodySmall" style={styles.splitLabel}>
            {t('profile.preview.seriesPercent', { percent: tvPercent })}
          </AppText>
        </View>

        <View style={styles.metrics}>
          <Metric
            label={t('profile.preview.moviesWatched')}
            value={statistics.summary.moviesWatched}
          />
          <Metric
            label={t('profile.preview.episodesWatched')}
            value={statistics.summary.episodesWatched}
          />
          <Metric
            label={t('profile.preview.showsStarted')}
            value={statistics.summary.showsStarted}
          />
          <Metric
            label={t('profile.preview.showsCompleted')}
            value={statistics.summary.showsCompleted}
          />
        </View>

        {completionRatio !== null && statistics.summary.showsStarted >= 2 ? (
          <AppText variant="caption" muted style={styles.completion}>
            {t('profile.preview.completionRatio', { percent: completionRatio })}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric} accessibilityRole="text">
      <AppText variant="bodySmall" style={styles.metricValue}>
        {value}
      </AppText>
      <AppText variant="caption" muted>
        {label}
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
  splitTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.progressTrack,
  },
  movieFill: {
    backgroundColor: colors.progressInProgress,
    minWidth: 4,
  },
  tvFill: {
    backgroundColor: colors.progressCompleted,
    minWidth: 4,
  },
  splitLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  splitLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    width: '48%',
    gap: 2,
  },
  metricValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  completion: {
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
