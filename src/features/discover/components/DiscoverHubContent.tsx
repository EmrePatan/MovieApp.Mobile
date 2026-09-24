import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translateDiscoveryBrowseMode } from '@/i18n/catalog-labels';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { GlobalSearchEntry } from '@/features/navigation/components/GlobalSearchEntry';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { useQueryClient } from '@tanstack/react-query';
import { useExplorePreview } from '@/features/discovery/hooks/useExplorePreview';
import { createAdvancedDiscoverHref } from '@/features/discovery/utils/advanced-discover-params';
import { createDiscoverHref } from '@/features/discovery/utils/discover-params';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import type { SearchResultItem } from '@/features/search/types';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { useNowInTheatersPreview } from '@/features/discovery/hooks/useNowInTheatersPreview';
import { useOnTvThisWeekPreview } from '@/features/discovery/hooks/useOnTvThisWeekPreview';
import { WorldCinemaHubSection } from './WorldCinemaHubSection';
import { StreamingPlatformsHubSection } from '@/features/discovery/components/StreamingPlatformsHubSection';
import { createNowInTheatersHref } from '@/features/discovery/utils/now-in-theaters-params';
import { DiscoverFeatureEntry } from './DiscoverFeatureEntry';
import { DiscoverPreviewCarousel } from './DiscoverPreviewCarousel';
import { DiscoverPreviewSection } from './DiscoverPreviewSection';
import { spacing } from '@/theme/spacing';
import { scrollScrollViewToTop } from '@/features/navigation/scroll-to-top';
import { usePrimaryTabReselectHandler } from '@/features/navigation/usePrimaryTabReselectHandler';

export function DiscoverHubContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const { region: userRegion, isHydrated } = useRegionalPreference();
  const previewQuery = useExplorePreview(10);
  const nowInTheatersPreviewQuery = useNowInTheatersPreview(userRegion, isHydrated);
  const onTvThisWeekPreviewQuery = useOnTvThisWeekPreview();

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
    openLibraryStackScreen(
      router,
      createDiscoverHref({ mode: 'trending', type: 'all' }),
      '/(tabs)/discover',
    );
  }, [router]);

  const openTopRatedBrowse = useCallback(() => {
    openLibraryStackScreen(
      router,
      createDiscoverHref({ mode: 'top_rated', type: 'all' }),
      '/(tabs)/discover',
    );
  }, [router]);

  const openNewReleasesBrowse = useCallback(() => {
    openLibraryStackScreen(
      router,
      createDiscoverHref({ mode: 'new_releases', type: 'all' }),
      '/(tabs)/discover',
    );
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

  const openAiRecommendations = useCallback(() => {
    router.push('/ai-recommendations');
  }, [router]);

  const trendingItems = previewQuery.data?.trending.items ?? [];
  const topRatedItems = previewQuery.data?.topRated.items ?? [];
  const newReleasesItems = previewQuery.data?.newReleases.items ?? [];
  const nowInTheatersItems = (nowInTheatersPreviewQuery.data?.items ?? []).filter(
    (item) => item.type === 'movie',
  );
  const onTvThisWeekItems = (onTvThisWeekPreviewQuery.data?.items ?? []).filter(
    (item) => item.type === 'tv',
  );

  const scrollDiscoverToTop = useCallback(() => {
    scrollScrollViewToTop(scrollRef);
  }, []);

  const refreshDiscoverHub = useCallback(() => {
    void previewQuery.refetch();
    void nowInTheatersPreviewQuery.refetch();
    void onTvThisWeekPreviewQuery.refetch();
  }, [nowInTheatersPreviewQuery, onTvThisWeekPreviewQuery, previewQuery]);

  usePrimaryTabReselectHandler('discover', {
    scrollToTop: scrollDiscoverToTop,
    refresh: refreshDiscoverHub,
  });

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {t('discover.hub.title')}
        </AppText>
        <GlobalSearchEntry origin="discover" variant="discover" />
      </View>

      <View style={styles.featureSection}>
        <AppText variant="bodySmall" muted style={styles.sectionEyebrow}>
          {t('discover.hub.eyebrow')}
        </AppText>
        <DiscoverFeatureEntry
          title={t('discover.hub.advancedDiscover.title')}
          subtitle={t('discover.hub.advancedDiscover.subtitle')}
          icon="options-outline"
          onPress={openAdvancedDiscover}
          accessibilityLabel={t('discover.hub.advancedDiscover.accessibility')}
        />
        <DiscoverFeatureEntry
          title={t('discover.hub.pickSomething.title')}
          subtitle={t('discover.hub.pickSomething.subtitle')}
          icon="shuffle-outline"
          onPress={openPickSomething}
          accessibilityLabel={t('discover.hub.pickSomething.accessibility')}
        />
        <DiscoverFeatureEntry
          title={t('discover.hub.aiRecommendations.title')}
          subtitle={t('discover.hub.aiRecommendations.subtitle')}
          icon="sparkles-outline"
          onPress={openAiRecommendations}
          accessibilityLabel={t('discover.hub.aiRecommendations.accessibility')}
        />
      </View>

      <StreamingPlatformsHubSection />

      <WorldCinemaHubSection />

      <DiscoverPreviewSection
        title={t('discover.hub.nowInTheaters.title')}
        subtitle={t('discover.hub.nowInTheaters.subtitle')}
        icon="film-outline"
        items={nowInTheatersItems}
        isLoading={nowInTheatersPreviewQuery.isLoading}
        isError={nowInTheatersPreviewQuery.isError}
        onRetry={() => void nowInTheatersPreviewQuery.refetch()}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openNowInTheaters}
        emptyMessage={t('discover.hub.nowInTheaters.empty')}
        testID="now-in-theaters-preview"
      />

      <DiscoverPreviewSection
        title={t('discover.hub.onTvThisWeek.title')}
        subtitle={t('discover.hub.onTvThisWeek.subtitle')}
        icon="calendar-outline"
        items={onTvThisWeekItems}
        isLoading={onTvThisWeekPreviewQuery.isLoading}
        isError={onTvThisWeekPreviewQuery.isError}
        onRetry={() => void onTvThisWeekPreviewQuery.refetch()}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openOnTvThisWeek}
        emptyMessage={t('discover.hub.onTvThisWeek.empty')}
        testID="on-tv-this-week-preview"
      />

      <DiscoverPreviewCarousel
        title={translateDiscoveryBrowseMode('trending')}
        items={trendingItems}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openTrendingBrowse}
      />
      <DiscoverPreviewCarousel
        title={translateDiscoveryBrowseMode('top_rated')}
        items={topRatedItems}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openTopRatedBrowse}
      />
      <DiscoverPreviewCarousel
        title={translateDiscoveryBrowseMode('new_releases')}
        items={newReleasesItems}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openNewReleasesBrowse}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  featureSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
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
});
