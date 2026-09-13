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
  if (ratingsCount === 0) {
    return (
      <View style={styles.section}>
        <ProfileSectionHeader title="Your Ratings" subtitle="How you score what you watch" />
        <ProfileEmptyInsight message="Rate a few titles to reveal your rating style." />
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
      <ProfileSectionHeader title="Your Ratings" subtitle="How you score what you watch" />
      <View style={styles.card}>
        <View style={styles.summaryRow}>
          <SummaryStat label="Average" value={formatAverageRating(ratings.averageStarRating)} />
          <SummaryStat
            label="Most used"
            value={ratings.mostUsedStars ? `${ratings.mostUsedStars}★` : '—'}
          />
          <SummaryStat label="Total" value={String(ratingsCount)} />
        </View>

        {ratings.distribution.map((item) => (
          <ProfileBarRow
            key={item.stars}
            label={`${item.stars}★`}
            valueLabel={String(item.count)}
            progress={item.count / maxCount}
            accessibilityLabel={`${item.stars} stars: ${item.count} ratings.`}
            accentColor={colors.progressCompleted}
          />
        ))}

        {ratings.mostUsedStars ? (
          <AppText variant="caption" muted style={styles.insight}>
            You most often rate titles {ratings.mostUsedStars}★.
          </AppText>
        ) : null}
        {fiveStarCount > 0 ? (
          <AppText variant="caption" muted>
            {fiveStarCount} perfect 5★ ratings in your history.
          </AppText>
        ) : null}
        {lowRatingCount > 0 ? (
          <AppText variant="caption" muted>
            {lowRatingCount} ratings at 2★ or below.
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
    padding: spacing.md,
    gap: spacing.md,
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
