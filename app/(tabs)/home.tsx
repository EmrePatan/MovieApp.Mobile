import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';
import { ErrorView } from '@/components/common/ErrorView';
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeLoadingState } from '@/features/home/components/HomeLoadingState';
import { HomeSection } from '@/features/home/components/HomeSection';
import { HomeTypeFilterControl } from '@/features/home/components/HomeTypeFilterControl';
import { homeQueryKey, useHome } from '@/features/home/hooks/useHome';
import type { HomeItem, HomeSection as HomeSectionModel, HomeTypeFilter } from '@/features/home/types';
import { DEFAULT_HOME_SECTION_SIZE } from '@/features/home/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<HomeTypeFilter>('all');
  const { data, error, isLoading, isFetching, refetch, isError } = useHome(
    typeFilter,
    DEFAULT_HOME_SECTION_SIZE,
  );

  const sections = useMemo(
    () => (data?.sections ?? []).filter((section) => section.items.length > 0),
    [data?.sections],
  );

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
      if (item.contentType === 'movie') {
        router.push(`/movie/${item.id}`);
        return;
      }

      router.push(`/tv/${item.id}`);
    },
    [router],
  );

  const renderSection = useCallback(
    ({ item }: { item: HomeSectionModel }) => (
      <HomeSection section={item} onItemPress={handleItemPress} />
    ),
    [handleItemPress],
  );

  const listHeader = (
    <View>
      <HomeHeader />
      <HomeTypeFilterControl value={typeFilter} onChange={setTypeFilter} />
    </View>
  );

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <HomeLoadingState />
      </SafeAreaView>
    );
  }

  if (isError && error && !data) {
    if (isApiError(error) && error.kind === 'unauthorized') {
      return (
        <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
          {listHeader}
          <View style={styles.centered}>
            <HomeLoadingState />
          </View>
        </SafeAreaView>
      );
    }

    const message = isApiError(error)
      ? error.userMessage
      : 'Unable to load your home feed. Please try again.';

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.centered}>
          <ErrorView message={message} onRetry={handleRetry} retryLabel="Try Again" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={sections}
        keyExtractor={(section) => `${section.type}-${section.displayOrder}`}
        renderItem={renderSection}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={<HomeEmptyState />}
        contentContainerStyle={sections.length === 0 ? styles.emptyContent : styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
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
