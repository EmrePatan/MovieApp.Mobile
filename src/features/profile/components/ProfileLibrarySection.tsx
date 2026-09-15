import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { UserStatisticsSummaryResponse } from '../types';
import {
  formatFavoritesSubtitle,
  formatFollowingSubtitle,
  formatWatchHistorySubtitle,
  formatWatchlistSubtitle,
} from '../utils/library-copy';
import { ProfileSection } from './ProfileSection';
import { spacing } from '@/theme/spacing';

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
    <ProfileSection title="My Library">
      <View
        style={styles.summary}
        accessibilityRole="text"
        accessibilityLabel={`Library collections: ${collectionSummary}`}
      >
        <AppText variant="bodySmall" muted>
          {collectionSummary}
        </AppText>
      </View>
    </ProfileSection>
  );
}

const styles = StyleSheet.create({
  summary: {
    paddingVertical: spacing.sm,
  },
});
