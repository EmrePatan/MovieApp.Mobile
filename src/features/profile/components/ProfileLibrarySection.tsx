import { useRouter } from 'expo-router';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
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

  return (
    <ProfileSection title="My Library">
      <ProfileMenuRow
        label="Favorites"
        subtitle={formatFavoritesSubtitle(summary.favoritesCount)}
        onPress={() => openLibraryStackScreen(router, '/favorites', '/(tabs)/profile')}
      />
      <ProfileMenuRow
        label="Watchlist"
        subtitle={formatWatchlistSubtitle(summary.watchlistCount)}
        onPress={() => router.push('/(tabs)/watchlist')}
      />
      <ProfileMenuRow
        label="Watch History"
        subtitle={formatWatchHistorySubtitle(summary.moviesWatched, summary.episodesWatched)}
        onPress={() => openLibraryStackScreen(router, '/watch-history', '/(tabs)/profile')}
      />
      <ProfileMenuRow
        label="Following"
        subtitle={formatFollowingSubtitle(followingCount)}
        onPress={() => openLibraryStackScreen(router, '/following', '/(tabs)/profile')}
      />
    </ProfileSection>
  );
}
