import { useRouter } from 'expo-router';
import type { UserStatisticsSummaryResponse } from '../types';
import {
  formatFavoritesSubtitle,
  formatFollowingSubtitle,
  formatWatchHistorySubtitle,
  formatWatchlistSubtitle,
} from '../utils/library-copy';
import { ProfileMenuRow, ProfileSection } from './ProfileSection';

interface ProfileLibrarySectionProps {
  summary: UserStatisticsSummaryResponse;
  followingCount: number;
}

export function ProfileLibrarySection({
  summary,
  followingCount,
}: ProfileLibrarySectionProps) {
  const router = useRouter();

  const collectionSummary = [
    formatFavoritesSubtitle(summary.favoritesCount),
    formatWatchlistSubtitle(summary.watchlistCount),
    formatFollowingSubtitle(followingCount),
    formatWatchHistorySubtitle(summary.moviesWatched, summary.episodesWatched),
  ].join(' · ');

  return (
    <ProfileSection title="My Library">
      <ProfileMenuRow
        label="Open My Library"
        subtitle={collectionSummary}
        onPress={() => router.push('/(tabs)/library')}
      />
    </ProfileSection>
  );
}
