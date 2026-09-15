import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { UserStatisticsSummaryResponse } from '../types';
import {
  formatFavoritesSubtitle,
  formatFollowingSubtitle,
  formatWatchHistorySubtitle,
  formatWatchlistSubtitle,
} from '../utils/library-copy';
import { ProfileSectionHeader } from './ProfileSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileLibrarySectionProps {
  summary: UserStatisticsSummaryResponse;
  followingCount: number;
}

export function ProfileLibrarySection({
  summary,
  followingCount,
}: ProfileLibrarySectionProps) {
  const collectionSummary = [
    formatFavoritesSubtitle(summary.favoritesCount),
    formatWatchlistSubtitle(summary.watchlistCount),
    formatFollowingSubtitle(followingCount),
    formatWatchHistorySubtitle(summary.moviesWatched, summary.episodesWatched),
  ].join(' · ');

  return (
    <View style={styles.section}>
      <ProfileSectionHeader title="My Library" />
      <View
        style={styles.card}
        accessibilityRole="text"
        accessibilityLabel={`Library collections: ${collectionSummary}`}
      >
        <AppText variant="bodySmall" muted>
          {collectionSummary}
        </AppText>
      </View>
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
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
