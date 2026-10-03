import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translateDiscoveryBrowseMode } from '@/i18n/catalog-labels';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { useQueryClient } from '@tanstack/react-query';
import { useExplorePreview } from '@/features/discovery/hooks/useExplorePreview';
import { createAdvancedDiscoverHref } from '@/features/discovery/utils/advanced-discover-params';
import { createDiscoverHref } from '@/features/discovery/utils/discover-params';
import { selectTitleListItems } from '@/features/discovery/utils/select-title-list-items';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import type { SearchResultItem } from '@/features/search/types';
import { GenresHubSection } from '@/features/discovery/components/GenresHubSection';
import { StreamingPlatformsHubSection } from '@/features/discovery/components/StreamingPlatformsHubSection';
import { discoverFeatureBackgrounds } from '../discover-feature-backgrounds';
import { DiscoverFeatureEntry } from './DiscoverFeatureEntry';
import { DiscoverPreviewCarousel } from './DiscoverPreviewCarousel';
import { WorldCinemaHubSection } from './WorldCinemaHubSection';
import { useHomeHeaderLayout } from '@/features/home/hooks/useHomeHeaderLayout';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { scrollScrollViewToTop } from '@/features/navigation/scroll-to-top';
import { usePrimaryTabReselectHandler } from '@/features/navigation/usePrimaryTabReselectHandler';
import { useAppConfig } from '@/features/app-config/hooks/useAppConfig';
import type { DiscoveryBrowseMode } from '@/features/discovery/types';

export function DiscoverHubContent() {
  const { t } = useTranslation();
  const headerLayout = useHomeHeaderLayout();
  const { config } = useAppConfig();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const previewQuery = useExplorePreview(10);

  const handlePreviewItemPress = useCallback(
    (item: SearchResultItem) => {
      if (item.type !== 'movie' && item.type !== 'tv') {
        return;
      }

      openCatalogDetailFromTab(router, item.id, item.type, 'discover', { queryClient });
    },
    [queryClient, router],
  );

  const openAdvancedDiscover = useCallback(() => {
    router.push(createAdvancedDiscoverHref());
  }, [router]);

  const openBrowse = useCallback(
    (mode: DiscoveryBrowseMode) => {
      openLibraryStackScreen(router, createDiscoverHref({ mode, type: 'all' }), '/(tabs)/discover');
    },
    [router],
  );

  const openPickSomething = useCallback(() => {
    router.push('/pick-something');
  }, [router]);

  const openAiRecommendations = useCallback(() => {
    router.push('/ai-recommendations');
  }, [router]);

  const hiddenGemsItems = selectTitleListItems(previewQuery.data?.hiddenGems?.items ?? []);
  const popularItems = selectTitleListItems(previewQuery.data?.popular?.items ?? []);
  const topRatedItems = selectTitleListItems(previewQuery.data?.topRated?.items ?? []);
  const newReleasesItems = selectTitleListItems(previewQuery.data?.newReleases?.items ?? []);

  const scrollDiscoverToTop = useCallback(() => {
    scrollScrollViewToTop(scrollRef);
  }, []);

  const refreshDiscoverHub = useCallback(() => {
    void previewQuery.refetch();
  }, [previewQuery]);

  usePrimaryTabReselectHandler('discover', {
    scrollToTop: scrollDiscoverToTop,
    refresh: refreshDiscoverHub,
  });

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerLayout.heroOffsetCompensation + spacing.sm },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.featureSection}>
        <DiscoverFeatureEntry
          title={t('discover.hub.advancedDiscover.title')}
          subtitle={t('discover.hub.advancedDiscover.subtitle')}
          icon="options-outline"
          onPress={openAdvancedDiscover}
          accessibilityLabel={t('discover.hub.advancedDiscover.accessibility')}
          backgroundSource={discoverFeatureBackgrounds.advancedDiscover}
          backgroundTestID="discover-feature-backdrop-advanced"
        />
        <DiscoverFeatureEntry
          title={t('discover.hub.pickSomething.title')}
          subtitle={t('discover.hub.pickSomething.subtitle')}
          icon="shuffle-outline"
          onPress={openPickSomething}
          accessibilityLabel={t('discover.hub.pickSomething.accessibility')}
          backgroundSource={discoverFeatureBackgrounds.pickSomething}
          backgroundTestID="discover-feature-backdrop-pick"
        />
        {config.features.aiRecommendations ? (
          <DiscoverFeatureEntry
            title={t('discover.hub.aiRecommendations.title')}
            subtitle={t('discover.hub.aiRecommendations.subtitle')}
            icon="sparkles-outline"
            onPress={openAiRecommendations}
            accessibilityLabel={t('discover.hub.aiRecommendations.accessibility')}
            backgroundSource={discoverFeatureBackgrounds.aiRecommendations}
            backgroundTestID="discover-feature-backdrop-ai"
          />
        ) : null}
      </View>

      <View style={styles.rails}>
        <StreamingPlatformsHubSection />
        <GenresHubSection />
        <WorldCinemaHubSection />

        <DiscoverPreviewCarousel
          title={translateDiscoveryBrowseMode('hidden_gems')}
          items={hiddenGemsItems}
          onItemPress={handlePreviewItemPress}
          onSeeAll={() => openBrowse('hidden_gems')}
          testID="discover-rail-hidden-gems"
        />
        <DiscoverPreviewCarousel
          title={translateDiscoveryBrowseMode('popular')}
          items={popularItems}
          onItemPress={handlePreviewItemPress}
          onSeeAll={() => openBrowse('popular')}
          testID="discover-rail-popular"
        />
        <DiscoverPreviewCarousel
          title={translateDiscoveryBrowseMode('new_releases')}
          items={newReleasesItems}
          onItemPress={handlePreviewItemPress}
          onSeeAll={() => openBrowse('new_releases')}
          testID="discover-rail-new-releases"
        />
        <DiscoverPreviewCarousel
          title={translateDiscoveryBrowseMode('top_rated')}
          items={topRatedItems}
          onItemPress={handlePreviewItemPress}
          onSeeAll={() => openBrowse('top_rated')}
          testID="discover-rail-top-rated"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
    gap: layout.sectionGap,
  },
  featureSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  rails: {
    gap: layout.sectionGap,
  },
});
