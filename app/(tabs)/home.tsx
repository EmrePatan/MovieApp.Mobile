import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { useQueryClient } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';
import { ErrorView } from '@/components/common/ErrorView';
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState';
import { HomeListHeader } from '@/features/home/components/HomeListHeader';
import { HomeLoadingState } from '@/features/home/components/HomeLoadingState';
import { HomeComingUpSection } from '@/features/home/components/HomeComingUpSection';
import { HomeSection } from '@/features/home/components/HomeSection';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { HomeTopChrome } from '@/features/home/components/HomeTopChrome';
import { useHome } from '@/features/home/hooks/useHome';
import type { HomeItem, HomeSection as HomeSectionModel } from '@/features/home/types';
import { DEFAULT_HOME_SECTION_SIZE } from '@/features/home/types';
import { homeSectionKeyExtractor } from '@/features/home/utils/home-list-keys';
import { getHomeSectionRowLayout } from '@/features/home/utils/home-list-layout';
import { presentHomeSections } from '@/features/home/utils/present-home-sections';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isHomeFocused, setIsHomeFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsHomeFocused(true);

      return () => {
        setIsHomeFocused(false);
      };
    }, []),
  );

  const { data, error, isLoading, isFetching, refetch, isError } = useHome(
    'all',
    DEFAULT_HOME_SECTION_SIZE,
  );

  const { sections, heroItems, showColdWelcome } = useMemo(() => {
    const nonEmptySections = (data?.sections ?? []).filter(
      (section) => section.items.length > 0,
    );

    return presentHomeSections(nonEmptySections, data?.isPersonalized ?? false);
  }, [data?.isPersonalized, data?.sections]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

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
      router.push(buildCatalogDetailRoute(item.id, item.contentType === 'movie' ? 'movie' : 'tv'));
    },
    [router],
  );

  const handleExplorePress = useCallback(() => {
    router.push('/(tabs)/search?explore=1');
  }, [router]);

  const handleSeeAllPress = useCallback(
    (sectionType: HomeSectionModel['type']) => {
      if (sectionType === 'Trending') {
        openLibraryStackScreen(router, '/discover?mode=trending&type=all');
        return;
      }

      if (sectionType === 'TopRated') {
        openLibraryStackScreen(router, '/discover?mode=top_rated&type=all');
        return;
      }

      if (sectionType === 'NewReleases') {
        openLibraryStackScreen(router, '/discover?mode=new_releases&type=all');
        return;
      }

      if (sectionType === 'ComingUp') {
        openLibraryStackScreen(router, '/upcoming');
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
      <RefreshControl
        refreshing={isFetching && !isLoading}
        onRefresh={handleRefresh}
        tintColor={colors.accent}
      />
    ),
    [handleRefresh, isFetching, isLoading],
  );

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {topChrome}
        <HomeLoadingState showTopChrome={false} />
      </SafeAreaView>
    );
  }

  if (isError && error && !data) {
    if (isApiError(error) && error.kind === 'unauthorized') {
      return (
        <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
          {topChrome}
          <View style={styles.centered}>
            <HomeLoadingState showTopChrome={false} />
          </View>
        </SafeAreaView>
      );
    }

    const message = isApiError(error)
      ? error.userMessage
      : 'Unable to load your home feed. Please try again.';

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {topChrome}
        <View style={styles.centered}>
          <ErrorView message={message} onRetry={handleRetry} retryLabel="Try Again" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {topChrome}
      <FlatList
        data={sections}
        keyExtractor={homeSectionKeyExtractor}
        renderItem={renderSection}
        ListHeaderComponent={listHeader}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
