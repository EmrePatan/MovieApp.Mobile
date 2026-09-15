import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useGenres } from '../hooks/useGenres';
import { createDiscoverHref } from '../utils/discover-params';
import { ExploreGenreSection } from './ExploreGenreSection';
import { spacing } from '@/theme/spacing';

interface SearchExploreLandingProps {
  onItemPress: (item: import('@/features/home/types').HomeItem) => void;
}

export function SearchExploreLanding(_props: SearchExploreLandingProps) {
  const router = useRouter();
  const genresQuery = useGenres();

  const handleGenrePress = useCallback(
    (genreId: string) => {
      router.push(
        createDiscoverHref({
          mode: 'trending',
          type: 'all',
          filters: { genreIds: [genreId] },
        }),
      );
    },
    [router],
  );

  return (
    <View style={styles.container}>
      <ExploreGenreSection
        genres={genresQuery.data ?? []}
        onGenrePress={handleGenrePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
  },
});
