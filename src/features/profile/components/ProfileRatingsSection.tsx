import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { UserStatisticsRatingsResponse } from '../types';
import { formatAverageRating } from '../utils/profile-analytics';
import { ProfileBarRow } from './ProfileBarRow';
import { ProfileEmptyInsight } from './ProfileEmptyInsight';
import { ProfileSectionHeader } from './ProfileSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileRatingsSectionProps {
  ratings: UserStatisticsRatingsResponse;
  ratingsCount: number;
}

export function ProfileRatingsSection({ ratings, ratingsCount }: ProfileRatingsSectionProps) {
  const { t } = useTranslation();

  if (ratingsCount === 0) {
    return (
      <View style={styles.section}>
        <ProfileSectionHeader
          title={t('profile.preview.ratingsTitle')}
          subtitle={t('profile.preview.ratingsSubtitle')}
        />
        <ProfileEmptyInsight message={t('profile.preview.ratingsEmpty')} />
      </View>
    );
  }

  const maxCount = Math.max(...ratings.distribution.map((item) => item.count), 1);
  const fiveStarCount = ratings.distribution.find((item) => item.stars === 5)?.count ?? 0;
  const lowRatingCount = ratings.distribution
    .filter((item) => item.stars <= 2)
    .reduce((sum, item) => sum + item.count, 0);

  return (
    <View style={styles.section}>
      <ProfileSectionHeader
        title={t('profile.preview.ratingsTitle')}
        subtitle={t('profile.preview.ratingsSubtitle')}
      />
      <View style={styles.card}>
        <View style={styles.summaryRow}>
          <SummaryStat label={t('profile.preview.average')} value={formatAverageRating(ratings.averageStarRating)} />
          <SummaryStat
            label={t('profile.preview.mostUsed')}
            value={ratings.mostUsedStars ? `${ratings.mostUsedStars}★` : '—'}
          />
          <SummaryStat label={t('profile.preview.total')} value={String(ratingsCount)} />
        </View>

        {ratings.distribution.map((item) => (
          <ProfileBarRow
            key={item.stars}
            label={`${item.stars}★`}
            valueLabel={String(item.count)}
            progress={item.count / maxCount}
            accessibilityLabel={t('profile.preview.starsAccessibility', {
              stars: item.stars,
              count: item.count,
            })}
            accentColor={colors.accent}
          />
        ))}

        {ratings.mostUsedStars ? (
          <AppText variant="caption" muted style={styles.insight}>
            {t('profile.preview.mostOftenRate', { stars: ratings.mostUsedStars })}
          </AppText>
        ) : null}
        {fiveStarCount > 0 ? (
          <AppText variant="caption" muted>
            {t('profile.preview.perfectRatings', { count: fiveStarCount })}
          </AppText>
        ) : null}
        {lowRatingCount > 0 ? (
          <AppText variant="caption" muted>
            {t('profile.preview.lowRatings', { count: lowRatingCount })}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat} accessibilityRole="text">
      <AppText variant="bodySmall" style={styles.summaryValue}>
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  insight: {
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
