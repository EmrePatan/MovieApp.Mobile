import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { useFocusEffect, useRouter } from 'expo-router';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { useQueryClient } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';
import { ErrorView } from '@/components/common/ErrorView';
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState';
import { HomeListHeader } from '@/features/home/components/HomeListHeader';
import { HomeLoadingState } from '@/features/home/components/HomeLoadingState';
import { HomeComingUpSection } from '@/features/home/components/HomeComingUpSection';
import { HomePersonalizedLoadingSlot } from '@/features/home/components/HomePersonalizedLoadingSlot';
import { HomeSection } from '@/features/home/components/HomeSection';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { openComingUpScreen } from '@/features/upcoming/navigation/coming-up-navigation';
import { HomeScreenShell } from '@/features/home/components/HomeScreenShell';
import { HomeTopChrome } from '@/features/home/components/HomeTopChrome';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import type { HomeItem, HomeSection as HomeSectionModel } from '@/features/home/types';
import { DEFAULT_HOME_SECTION_SIZE } from '@/features/home/types';
import { homeSectionKeyExtractor } from '@/features/home/utils/home-list-keys';
import { getHomeSectionRowLayout } from '@/features/home/utils/home-list-layout';
import { presentHomeSections } from '@/features/home/utils/present-home-sections';
import { markHomePerfEvent } from '@/perf/home-cold-start-trace';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isHomeFocused, setIsHomeFocused] = useState(true);
  const hasLoggedMeaningfulRender = useRef(false);
  const hasLoggedPersonalizedRender = useRef(false);

  useEffect(() => {
    markHomePerfEvent('home_mount');
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsHomeFocused(true);

      return () => {
        setIsHomeFocused(false);
      };
    }, []),
  );

  const {
    browse,
    personalized,
    mergedSections,
    personalization,
    isInitialBrowseLoading,
    isFetching,
    refetch,
  } = useHomeFeed('all', DEFAULT_HOME_SECTION_SIZE);

  const { sections, heroItems, showColdWelcome } = useMemo(() => {
    const nonEmptySections = mergedSections.filter((section) => section.items.length > 0);
    return presentHomeSections(nonEmptySections, personalization);
  }, [mergedSections, personalization]);

  const showPersonalizedLoadingSlot = personalization === 'unknown' && !personalized.isError;

  const hasVisibleBrowseContent = heroItems.length > 0 || sections.length > 0;

  useEffect(() => {
    if (hasLoggedMeaningfulRender.current || isInitialBrowseLoading || !hasVisibleBrowseContent) {
      return;
    }

    hasLoggedMeaningfulRender.current = true;
    markHomePerfEvent('first_meaningful_render');
  }, [hasVisibleBrowseContent, isInitialBrowseLoading]);

  useEffect(() => {
    if (hasLoggedPersonalizedRender.current || personalization === 'unknown') {
      return;
    }

    const hasPersonalizedVisible =
      showColdWelcome ||
      sections.some(
        (section) => section.type === 'RecommendedForYou' || section.type === 'ComingUp',
      );

    if (!hasPersonalizedVisible) {
      return;
    }

    hasLoggedPersonalizedRender.current = true;
    markHomePerfEvent('home_personalized_render');
  }, [personalization, sections, showColdWelcome]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleRetryBrowse = useCallback(() => {
    void browse.refetch();
  }, [browse]);

  const handleItemPress = useCallback(
    (item: HomeItem) => {
      openCatalogDetailFromTab(
        router,
        item.id,
        item.contentType === 'movie' ? 'movie' : 'tv',
        'home',
        { queryClient },
      );
    },
    [queryClient, router],
  );

  const handleComingUpItemPress = useCallback(
    (item: HomeItem) => {
      openCatalogDetailFromTab(
        router,
        item.id,
        item.contentType === 'movie' ? 'movie' : 'tv',
        'home',
        { queryClient },
      );
    },
    [queryClient, router],
  );

  const handleExplorePress = useCallback(() => {
    router.push('/(tabs)/discover');
  }, [router]);

  const handleSeeAllPress = useCallback(
    (sectionType: HomeSectionModel['type']) => {
      if (sectionType === 'Trending') {
        openLibraryStackScreen(
          router,
          '/discover-browse?mode=trending&type=all',
          '/(tabs)/home',
        );
        return;
      }

      if (sectionType === 'TopRated') {
        openLibraryStackScreen(
          router,
          '/discover-browse?mode=top_rated&type=all',
          '/(tabs)/home',
        );
        return;
      }

      if (sectionType === 'NewReleases') {
        openLibraryStackScreen(
          router,
          '/discover-browse?mode=new_releases&type=all',
          '/(tabs)/home',
        );
        return;
      }

      if (sectionType === 'ComingUp') {
        openComingUpScreen(router, 'for-you');
      }
    },
    [router],
  );

  const renderSection = useCallback(
    ({ item }: { item: HomeSectionModel }) => {
      if (item.type === 'ComingUp') {
        return (
          <HomeComingUpSection
            section={item}
            onItemPress={handleComingUpItemPress}
            onSeeAllPress={() => handleSeeAllPress(item.type)}
          />
        );
      }

      return (
        <HomeSection
          section={item}
          onItemPress={handleItemPress}
          onSeeAllPress={
            item.type === 'Trending' || item.type === 'TopRated' || item.type === 'NewReleases'
              ? () => handleSeeAllPress(item.type)
              : undefined
          }
        />
      );
    },
    [handleComingUpItemPress, handleItemPress, handleSeeAllPress],
  );

  const listHeader = useMemo(
    () => (
      <HomeListHeader
        heroItems={heroItems}
        showColdWelcome={showColdWelcome}
        onItemPress={handleItemPress}
        onExplorePress={handleExplorePress}
        isScreenFocused={isHomeFocused}
      />
    ),
    [heroItems, showColdWelcome, handleItemPress, handleExplorePress, isHomeFocused],
  );

  const topChrome = useMemo(() => <HomeTopChrome />, []);

  const listContentStyle = useMemo(
    () => (sections.length === 0 && !showColdWelcome ? styles.emptyContent : styles.content),
    [sections.length, showColdWelcome],
  );

  const refreshControl = useMemo(
    () => (
      <MovieAppRefreshControl
        refreshing={isFetching && !isInitialBrowseLoading}
        onRefresh={handleRefresh}
      />
    ),
    [handleRefresh, isFetching, isInitialBrowseLoading],
  );

  const listFooter = useMemo(
    () => (showPersonalizedLoadingSlot ? <HomePersonalizedLoadingSlot /> : null),
    [showPersonalizedLoadingSlot],
  );

  if (isInitialBrowseLoading) {
    return (
      <HomeScreenShell>
        {topChrome}
        <HomeLoadingState showTopChrome={false} />
      </HomeScreenShell>
    );
  }

  if (browse.isError && !browse.data) {
    const error = browse.error;

    if (isApiError(error) && error.kind === 'unauthorized') {
      return (
        <HomeScreenShell>
          {topChrome}
          <View style={styles.centered}>
            <HomeLoadingState showTopChrome={false} />
          </View>
        </HomeScreenShell>
      );
    }

    const message = isApiError(error)
      ? error.userMessage
      : 'Unable to load your home feed. Please try again.';

    return (
      <HomeScreenShell>
        {topChrome}
        <View style={styles.centered}>
          <ErrorView message={message} onRetry={handleRetryBrowse} retryLabel="Try Again" />
        </View>
      </HomeScreenShell>
    );
  }

  return (
    <HomeScreenShell>
      {topChrome}
      <FlatList
        data={sections}
        keyExtractor={homeSectionKeyExtractor}
        renderItem={renderSection}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={showColdWelcome ? null : HomeEmptyState}
        contentContainerStyle={listContentStyle}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
        getItemLayout={getHomeSectionRowLayout}
        removeClippedSubviews
      />
    </HomeScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  emptyContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
});
