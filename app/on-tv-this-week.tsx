import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
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
  const { t } = useTranslation();
  useTrackProductMetricOnFocus(PRODUCT_METRICS.onTvThisWeekOpened);
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
          {t('discover.hub.onTvThisWeek.title')}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('discover.hub.onTvThisWeek.subtitle')}
        </AppText>
      </View>
    ),
    [t],
  );

  const listEmpty = useMemo(() => {
    if (resultsQuery.isLoading) {
      return <SearchLoadingState />;
    }

    if (resultsQuery.isError) {
      const message = isApiError(resultsQuery.error)
        ? resultsQuery.error.userMessage
        : t('discovery.browseScreen.loadError');

      return (
        <View style={styles.errorContainer}>
          <ErrorView message={message} onRetry={() => void resultsQuery.refetch()} retryLabel={t('common.tryAgain')} />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <SearchEmptyState
          title={t('discover.hub.onTvThisWeek.title')}
          message={t('discover.hub.onTvThisWeek.empty')}
        />
      );
    }

    return null;
  }, [items.length, resultsQuery, t]);

  return (
    <StackListScreen
      topBar={
        <View style={styles.topBar}>
          <DetailBackButton />
        </View>
      }
    >
      <PlatformRefreshFlatList
        refreshing={resultsQuery.isRefetching && !resultsQuery.isFetchingNextPage}
        onRefresh={() => void resultsQuery.refetch()}
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
        onEndReached={() => {
          if (resultsQuery.hasNextPage && !resultsQuery.isFetchingNextPage) {
            void resultsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
      />
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
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
