import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { UserStatisticsSummaryResponse } from '../types';
import { ProfileMenuRow, ProfileSection } from './ProfileSection';

interface ProfileLibrarySectionProps {
  summary: UserStatisticsSummaryResponse;
}

export function ProfileLibrarySection({ summary }: ProfileLibrarySectionProps) {
  const router = useRouter();

  return (
    <ProfileSection title="Your Library">
      <ProfileMenuRow
        label="Favorites"
        subtitle={`${summary.favoritesCount} saved titles`}
        onPress={() => router.push('/favorites')}
      />
      <ProfileMenuRow
        label="Watchlist"
        subtitle={`${summary.watchlistCount} lists`}
        onPress={() => router.push('/(tabs)/watchlist')}
      />
      <ProfileMenuRow
        label="Watch History"
        subtitle={`${summary.moviesWatched + summary.episodesWatched} watched items`}
        onPress={() => router.push('/watch-history')}
      />
      <ProfileMenuRow
        label="Your Ratings"
        subtitle={`${summary.ratingsCount} ratings`}
      />
      <ProfileMenuRow
        label="Your Reviews"
        subtitle={`${summary.reviewsCount} reviews`}
      />
    </ProfileSection>
  );
}
