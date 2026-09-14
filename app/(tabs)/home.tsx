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
import { HomeSection } from '@/features/home/components/HomeSection';
import { HomeTopChrome } from '@/features/home/components/HomeTopChrome';
import { homeQueryKey, useHome } from '@/features/home/hooks/useHome';
import type { HomeItem, HomeSection as HomeSectionModel, HomeTypeFilter } from '@/features/home/types';
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
  const [typeFilter, setTypeFilter] = useState<HomeTypeFilter>('all');
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
    typeFilter,
    DEFAULT_HOME_SECTION_SIZE,
  );

  const { sections, heroItems } = useMemo(() => {
    const nonEmptySections = (data?.sections ?? []).filter(
      (section) => section.items.length > 0,
    );

    return presentHomeSections(nonEmptySections);
  }, [data?.sections]);

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: homeQueryKey(typeFilter, DEFAULT_HOME_SECTION_SIZE),
    });
  }, [queryClient, typeFilter]);

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

  const renderSection = useCallback(
    ({ item }: { item: HomeSectionModel }) => (
      <HomeSection section={item} onItemPress={handleItemPress} />
    ),
    [handleItemPress],
  );

  const listHeader = useMemo(
    () => (
      <HomeListHeader
        heroItems={heroItems}
        filterKey={typeFilter}
        onItemPress={handleItemPress}
        isScreenFocused={isHomeFocused}
      />
    ),
    [heroItems, typeFilter, handleItemPress, isHomeFocused],
  );

  const topChrome = useMemo(
    () => <HomeTopChrome typeFilter={typeFilter} onTypeFilterChange={setTypeFilter} />,
    [typeFilter],
  );

  const listContentStyle = useMemo(
    () => (sections.length === 0 ? styles.emptyContent : styles.content),
    [sections.length],
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
        ListEmptyComponent={HomeEmptyState}
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
