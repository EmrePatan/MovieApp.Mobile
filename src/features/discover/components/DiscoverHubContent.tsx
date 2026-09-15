import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { GlobalSearchEntry } from '@/features/navigation/components/GlobalSearchEntry';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { useQueryClient } from '@tanstack/react-query';
import { ExploreGenreSection } from '@/features/discovery/components/ExploreGenreSection';
import { useExplorePreview } from '@/features/discovery/hooks/useExplorePreview';
import { useGenres } from '@/features/discovery/hooks/useGenres';
import { createAdvancedDiscoverHref } from '@/features/discovery/utils/advanced-discover-params';
import { createDiscoverHref } from '@/features/discovery/utils/discover-params';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import type { SearchResultItem } from '@/features/search/types';
import { DiscoverFeatureEntry } from './DiscoverFeatureEntry';
import { DiscoverPreviewCarousel } from './DiscoverPreviewCarousel';
import { spacing } from '@/theme/spacing';

export function DiscoverHubContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const genresQuery = useGenres();
  const previewQuery = useExplorePreview(10);

  const handleGenrePress = useCallback(
    (genreId: string) => {
      openLibraryStackScreen(
        router,
        createDiscoverHref({
          mode: 'trending',
          type: 'all',
          filters: { genreIds: [genreId] },
        }),
        '/(tabs)/discover',
      );
    },
    [router],
  );

  const handlePreviewItemPress = useCallback(
    (item: SearchResultItem) => {
      if (item.type === 'person') {
        return;
      }

      openCatalogDetailFromTab(router, item.id, item.type, 'discover', { queryClient });
    },
    [queryClient, router],
  );

  const openAdvancedDiscover = useCallback(() => {
    router.push(createAdvancedDiscoverHref());
  }, [router]);

  const openTrendingBrowse = useCallback(() => {
    openLibraryStackScreen(router, '/discover?mode=trending&type=all', '/(tabs)/discover');
  }, [router]);

  const openTopRatedBrowse = useCallback(() => {
    openLibraryStackScreen(router, '/discover?mode=top_rated&type=all', '/(tabs)/discover');
  }, [router]);

  const openNewReleasesBrowse = useCallback(() => {
    openLibraryStackScreen(router, '/discover?mode=new_releases&type=all', '/(tabs)/discover');
  }, [router]);

  const trendingItems = previewQuery.data?.trending.items ?? [];
  const topRatedItems = previewQuery.data?.topRated.items ?? [];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          Discover
        </AppText>
        <GlobalSearchEntry origin="discover" />
      </View>

      <View style={styles.featureSection}>
        <AppText variant="bodySmall" muted style={styles.sectionEyebrow}>
          Find something new
        </AppText>
        <DiscoverFeatureEntry
          title="Explore with Filters"
          subtitle="Genre · Year · Rating · Runtime · Country"
          icon="options-outline"
          onPress={openAdvancedDiscover}
          accessibilityLabel="Explore with Filters"
        />
        <DiscoverFeatureEntry
          title="Streaming Services"
          subtitle="Find where to watch across providers"
          icon="tv-outline"
          comingSoon
        />
        <DiscoverFeatureEntry
          title="World Cinema"
          subtitle="Curated collections from around the world"
          icon="earth-outline"
          comingSoon
        />
        <DiscoverFeatureEntry
          title="Pick Something For Me"
          subtitle="Let MovieApp choose your next title"
          icon="shuffle-outline"
          comingSoon
        />
      </View>

      <View style={styles.futureSection}>
        <DiscoverFeatureEntry
          title="Now in Theaters"
          subtitle="Fresh releases playing now"
          icon="film-outline"
          comingSoon
        />
        <DiscoverFeatureEntry
          title="On TV This Week"
          subtitle="New and returning episodes"
          icon="calendar-outline"
          comingSoon
        />
      </View>

      <DiscoverPreviewCarousel
        title="Trending"
        items={trendingItems}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openTrendingBrowse}
      />
      <DiscoverPreviewCarousel
        title="Top Rated"
        items={topRatedItems}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openTopRatedBrowse}
      />

      <ExploreGenreSection genres={genresQuery.data ?? []} onGenrePress={handleGenrePress} />

      <View style={styles.footerBrowse}>
        <DiscoverFeatureEntry
          title="New Releases"
          subtitle="Browse the latest movies and shows"
          icon="sparkles-outline"
          onPress={openNewReleasesBrowse}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.md,
  },
  featureSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  futureSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  sectionEyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  footerBrowse: {
    paddingHorizontal: spacing.lg,
  },
});
