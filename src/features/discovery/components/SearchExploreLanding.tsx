import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { HomeSection } from '@/features/home/components/HomeSection';
import type { HomeItem, HomeSection as HomeSectionModel } from '@/features/home/types';
import { DEFAULT_HOME_SECTION_SIZE } from '@/features/home/types';
import { useExplorePreview } from '../hooks/useExplorePreview';
import { useGenres } from '../hooks/useGenres';
import { createDiscoverHref } from '../utils/discover-params';
import { mapCatalogItemToHomeItem } from '../utils/map-catalog-to-home-item';
import { ExploreGenreSection } from './ExploreGenreSection';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SearchExploreLandingProps {
  onItemPress: (item: HomeItem) => void;
}

function createPreviewSection(
  type: HomeSectionModel['type'],
  title: string,
  items: HomeItem[],
  displayOrder: number,
): HomeSectionModel {
  return { type, title, items, displayOrder };
}

export function SearchExploreLanding({ onItemPress }: SearchExploreLandingProps) {
  const router = useRouter();
  const previewQuery = useExplorePreview(DEFAULT_HOME_SECTION_SIZE);
  const genresQuery = useGenres();

  const handleSeeAll = useCallback(() => {
    router.push(createDiscoverHref({ mode: 'trending', type: 'all' }));
  }, [router]);

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

  const sections: HomeSectionModel[] = [];

  if (previewQuery.data) {
    sections.push(
      createPreviewSection(
        'Trending',
        'Trending Now',
        previewQuery.data.trending.items.map(mapCatalogItemToHomeItem),
        1,
      ),
    );
  }

  const visibleSections = sections.filter((section) => section.items.length > 0);

  return (
    <View style={styles.container}>
      {previewQuery.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}

      {previewQuery.isError ? (
        <View style={styles.error}>
          <AppText variant="bodySmall" muted>
            Unable to load discovery previews right now.
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading explore previews"
            onPress={() => void previewQuery.refetch()}
          >
            <AppText variant="bodySmall" style={styles.retry}>
              Try again
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {visibleSections.map((section) => (
        <HomeSection
          key={section.type}
          section={section}
          onItemPress={onItemPress}
          onSeeAllPress={section.type === 'Trending' ? handleSeeAll : undefined}
        />
      ))}

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
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  error: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  retry: {
    color: colors.accent,
    fontWeight: '600',
  },
});
