import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateWorldCinemaSort } from '@/i18n/catalog-labels';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { catalogBrowseListStyles } from '@/features/catalog/catalog-browse-list-styles';
import { CatalogListActions, CatalogSortSheet } from '@/features/catalog/components';
import { CatalogDiscoveryFilterSheet } from '@/features/discovery/components/CatalogDiscoveryFilterSheet';
import { useWorldCinema } from '@/features/discovery/hooks/useWorldCinema';
import {
  parseWorldCinemaParams,
  serializeWorldCinemaParams,
  serializeWorldCinemaRoute,
} from '@/features/discovery/utils/world-cinema-params';
import {
  filterDraftToWorldCinemaPatch,
  WORLD_CINEMA_FILTER_SHEET_CONFIG,
  worldCinemaStateToFilterDraft,
} from '@/features/discovery/utils/world-cinema-filter-adapters';
import {
  setDiscoveryRouteParams,
  WORLD_CINEMA_PARAM_KEYS,
} from '@/features/navigation/discovery-route-params';
import {
  clearWorldCinemaUserFilters,
  hasActiveWorldCinemaUserFilters,
  hasNonDefaultWorldCinemaSort,
  WORLD_CINEMA_SORT_OPTIONS,
  type WorldCinemaState,
} from '@/features/discovery/world-cinema-types';
import type { AdvancedDiscoverSort } from '@/features/discovery/advanced-discover-types';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import {
  flattenDedupedSearchResultPages,
  searchResultKeyExtractor,
} from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function WorldCinemaScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawParams = useLocalSearchParams();
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  useTrackProductMetricOnFocus(PRODUCT_METRICS.worldCinemaOpened);

  const discoverState = useMemo(
    () => parseWorldCinemaParams(rawParams),
    [rawParams],
  );

  const resultsQuery = useWorldCinema(discoverState);

  const items = useMemo(
    () => flattenDedupedSearchResultPages(resultsQuery.data?.pages),
    [resultsQuery.data?.pages],
  );

  const currentRoute = useMemo(
    () => serializeWorldCinemaRoute(discoverState),
    [discoverState],
  );

  const replaceState = useCallback(
    (next: WorldCinemaState) => {
      setDiscoveryRouteParams(
        router,
        serializeWorldCinemaParams(next),
        WORLD_CINEMA_PARAM_KEYS,
      );
    },
    [router],
  );

  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
      if (item.type !== 'movie' && item.type !== 'tv') {
        return;
      }

      prefetchCatalogDetail(queryClient, item.id, item.type);
      openCatalogDetailFromLibraryStack(
        router,
        item.id,
        item.type,
        'discover',
        { libraryReturnHref: currentRoute },
      );
    },
    [currentRoute, queryClient, router],
  );

  const sortOptions = useMemo(
    () =>
      WORLD_CINEMA_SORT_OPTIONS.map((value) => ({
        value,
        label: translateWorldCinemaSort(value),
      })),
    [],
  );

  const listHeaderContent = useMemo(
    () => (
      <View style={catalogBrowseListStyles.listHeader}>
        <View style={catalogBrowseListStyles.titleRow}>
          <AppText variant="title" accessibilityRole="header" style={catalogBrowseListStyles.title}>
            {t('discovery.worldCinemaScreen.title')}
          </AppText>
          <CatalogListActions
            sortActive={hasNonDefaultWorldCinemaSort(discoverState)}
            filterActive={hasActiveWorldCinemaUserFilters(discoverState)}
            sortAccessibilityLabel={t('discovery.catalogFilters.sortAction')}
            filterAccessibilityLabel={t('discovery.catalogFilters.filterAction')}
            onPressSort={() => setSortSheetVisible(true)}
            onPressFilter={() => setFilterSheetVisible(true)}
            testID="world-cinema-actions"
          />
        </View>
      </View>
    ),
    [discoverState, t],
  );

  const renderListHeader = useCallback(() => listHeaderContent, [listHeaderContent]);

  const listEmpty = useMemo(() => {
    if (resultsQuery.isLoading) {
      return <SearchLoadingState />;
    }

    if (resultsQuery.isError) {
      const message = isApiError(resultsQuery.error)
        ? resultsQuery.error.userMessage
        : t('discovery.worldCinemaScreen.loadError');

      return (
        <View style={catalogBrowseListStyles.errorContainer}>
          <ErrorView message={message} onRetry={() => void resultsQuery.refetch()} retryLabel={t('common.tryAgain')} />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <SearchEmptyState
          title={t('discovery.worldCinemaScreen.emptyTitle')}
          message={t('discovery.worldCinemaScreen.emptyMessage')}
        />
      );
    }

    return null;
  }, [items.length, resultsQuery, t]);

  return (
    <StackListScreen
      topBar={
        <View style={catalogBrowseListStyles.topBar}>
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
        ListHeaderComponent={renderListHeader}
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
        contentContainerStyle={catalogBrowseListStyles.listContent}
      />
      <CatalogSortSheet
        visible={sortSheetVisible}
        title={t('discovery.catalogFilters.sort')}
        closeLabel={t('common.close')}
        options={sortOptions}
        value={discoverState.sort}
        onSelect={(sort: AdvancedDiscoverSort) => replaceState({ ...discoverState, sort })}
        onClose={() => setSortSheetVisible(false)}
        testID="world-cinema-sort-sheet"
      />
      <CatalogDiscoveryFilterSheet
        visible={filterSheetVisible}
        draft={worldCinemaStateToFilterDraft(discoverState)}
        config={WORLD_CINEMA_FILTER_SHEET_CONFIG}
        onClose={() => setFilterSheetVisible(false)}
        onApply={(draft) => {
          replaceState(filterDraftToWorldCinemaPatch(draft, discoverState));
        }}
        onReset={() => {
          replaceState(clearWorldCinemaUserFilters(discoverState));
          setFilterSheetVisible(false);
        }}
        testID="world-cinema-filter-sheet"
      />
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
