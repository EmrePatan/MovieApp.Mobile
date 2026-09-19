import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { UserStatisticsSummaryResponse } from '../types';
import { formatAverageRating } from '../utils/profile-analytics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ProfileHeroStatsProps {
  summary: UserStatisticsSummaryResponse;
}

export function ProfileHeroStats({ summary }: ProfileHeroStatsProps) {
  const { t } = useTranslation();
  const watchedTotal = summary.moviesWatched + summary.episodesWatched;

  return (
    <View style={styles.container} accessibilityRole="summary">
      <StatItem
        label={t('profile.preview.watchActivity')}
        value={String(watchedTotal)}
        caption={t('profile.preview.moviesAndEpisodes')}
      />
      <View style={styles.divider} />
      <StatItem label={t('profile.preview.ratingsLabel')} value={String(summary.ratingsCount)} />
      <View style={styles.divider} />
      <StatItem
        label={t('profile.preview.average')}
        value={formatAverageRating(summary.averageStarRating)}
      />
    </View>
  );
}

function StatItem({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <View style={styles.item} accessibilityRole="text">
      <AppText variant="title" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" muted style={styles.label}>
        {label}
      </AppText>
      {caption ? (
        <AppText variant="caption" muted style={styles.caption}>
          {caption}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  caption: {
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'lowercase',
    letterSpacing: 0.2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
});
