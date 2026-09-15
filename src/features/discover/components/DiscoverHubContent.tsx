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
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { createStreamingDiscoverHref } from '@/features/discovery/utils/streaming-discover-params';
import { useNowInTheatersPreview } from '@/features/discovery/hooks/useNowInTheatersPreview';
import { useOnTvThisWeekPreview } from '@/features/discovery/hooks/useOnTvThisWeekPreview';
import { WorldCinemaHubSection } from './WorldCinemaHubSection';
import { createNowInTheatersHref } from '@/features/discovery/utils/now-in-theaters-params';
import { DiscoverFeatureEntry } from './DiscoverFeatureEntry';
import { DiscoverPreviewCarousel } from './DiscoverPreviewCarousel';
import { DiscoverPreviewSection } from './DiscoverPreviewSection';
import { spacing } from '@/theme/spacing';

export function DiscoverHubContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const genresQuery = useGenres();
  const { region: userRegion, isHydrated } = useRegionalPreference();
  const previewQuery = useExplorePreview(10);
  const nowInTheatersPreviewQuery = useNowInTheatersPreview(userRegion, isHydrated);
  const onTvThisWeekPreviewQuery = useOnTvThisWeekPreview();

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

  const openStreamingDiscover = useCallback(() => {
    router.push(createStreamingDiscoverHref({}, userRegion));
  }, [router, userRegion]);

  const openTrendingBrowse = useCallback(() => {
    openLibraryStackScreen(router, '/discover?mode=trending&type=all', '/(tabs)/discover');
  }, [router]);

  const openTopRatedBrowse = useCallback(() => {
    openLibraryStackScreen(router, '/discover?mode=top_rated&type=all', '/(tabs)/discover');
  }, [router]);

  const openNewReleasesBrowse = useCallback(() => {
    openLibraryStackScreen(router, '/discover?mode=new_releases&type=all', '/(tabs)/discover');
  }, [router]);

  const openNowInTheaters = useCallback(() => {
    router.push(createNowInTheatersHref({}, userRegion));
  }, [router, userRegion]);

  const openOnTvThisWeek = useCallback(() => {
    router.push('/on-tv-this-week');
  }, [router]);

  const openPickSomething = useCallback(() => {
    router.push('/pick-something');
  }, [router]);

  const trendingItems = previewQuery.data?.trending.items ?? [];
  const topRatedItems = previewQuery.data?.topRated.items ?? [];
  const nowInTheatersItems = (nowInTheatersPreviewQuery.data?.items ?? []).filter(
    (item) => item.type === 'movie',
  );
  const onTvThisWeekItems = (onTvThisWeekPreviewQuery.data?.items ?? []).filter(
    (item) => item.type === 'tv',
  );

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
          onPress={openStreamingDiscover}
          accessibilityLabel="Streaming Services"
        />
        <DiscoverFeatureEntry
          title="Pick Something For Me"
          subtitle="Let MovieApp choose your next title"
          icon="shuffle-outline"
          onPress={openPickSomething}
          accessibilityLabel="Pick Something For Me"
        />
      </View>

      <WorldCinemaHubSection />

      <DiscoverPreviewSection
        title="Now in Theaters"
        subtitle="Currently playing in theaters"
        icon="film-outline"
        items={nowInTheatersItems}
        isLoading={nowInTheatersPreviewQuery.isLoading}
        isError={nowInTheatersPreviewQuery.isError}
        onRetry={() => void nowInTheatersPreviewQuery.refetch()}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openNowInTheaters}
        emptyMessage="No movies are currently playing in theaters right now."
        testID="now-in-theaters-preview"
      />

      <DiscoverPreviewSection
        title="On TV This Week"
        subtitle="Episodes airing in the next 7 days"
        icon="calendar-outline"
        items={onTvThisWeekItems}
        isLoading={onTvThisWeekPreviewQuery.isLoading}
        isError={onTvThisWeekPreviewQuery.isError}
        onRetry={() => void onTvThisWeekPreviewQuery.refetch()}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openOnTvThisWeek}
        emptyMessage="No TV shows are airing this week right now."
        testID="on-tv-this-week-preview"
      />

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
