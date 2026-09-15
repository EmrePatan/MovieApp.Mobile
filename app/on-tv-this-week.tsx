import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { useOnTvThisWeek } from '@/features/discovery/hooks/useOnTvThisWeek';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const RETURN_ROUTE = '/on-tv-this-week';

export default function OnTvThisWeekScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resultsQuery = useOnTvThisWeek();

  const items = useMemo(
    () => resultsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [resultsQuery.data?.pages],
  );

  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
      if (item.type !== 'tv') {
        return;
      }

      prefetchCatalogDetail(queryClient, item.id, item.type);
      openCatalogDetailFromLibraryStack(
        router,
        item.id,
        item.type,
        'discover',
        { libraryReturnHref: RETURN_ROUTE },
      );
    },
    [queryClient, router],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          On TV This Week
        </AppText>
        <AppText variant="bodySmall" muted>
          TV shows with episodes airing in the next 7 days
        </AppText>
      </View>
    ),
    [],
  );

  const listEmpty = useMemo(() => {
    if (resultsQuery.isLoading) {
      return <SearchLoadingState />;
    }

    if (resultsQuery.isError) {
      const message = isApiError(resultsQuery.error)
        ? resultsQuery.error.userMessage
        : 'Unable to load TV airing listings right now.';

      return (
        <View style={styles.errorContainer}>
          <ErrorView message={message} onRetry={() => void resultsQuery.refetch()} retryLabel="Try Again" />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <SearchEmptyState
          title="No shows airing this week"
          message="There are no TV shows with episodes scheduled in the current airing window."
        />
      );
    }

    return null;
  }, [items.length, resultsQuery]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <DetailBackButton />
      </View>
      <FlatList
        data={items}
        keyExtractor={searchResultKeyExtractor}
        renderItem={({ item }) => (
          <SearchResultCard item={item} onPress={handleResultPress} />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          resultsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={colors.accent} style={styles.footerLoader} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={resultsQuery.isRefetching && !resultsQuery.isFetchingNextPage}
            onRefresh={() => void resultsQuery.refetch()}
            tintColor={colors.accent}
          />
        }
        onEndReached={() => {
          if (resultsQuery.hasNextPage && !resultsQuery.isFetchingNextPage) {
            void resultsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  errorContainer: {
    paddingVertical: spacing.lg,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
