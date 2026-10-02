import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateDiscoverySort } from '@/i18n/catalog-labels';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { catalogBrowseListStyles } from '@/features/catalog/catalog-browse-list-styles';
import { CatalogListActions, CatalogSortSheet } from '@/features/catalog/components';
import { CatalogDiscoveryFilterSheet } from '@/features/discovery/components/CatalogDiscoveryFilterSheet';
import { useDiscoveryBrowse } from '@/features/discovery/hooks/useDiscoveryBrowse';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import {
  clearDiscoveryUserFilters,
  DISCOVERY_SORT_OPTIONS,
  getDefaultSortForMode,
  getDiscoverBrowseScreenTitle,
  hasActiveDiscoveryUserFilters,
  hasNonDefaultDiscoverySort,
  type DiscoveryBrowseFilters,
  type DiscoveryBrowseState,
  type DiscoverySort,
  type DiscoveryTypeFilter,
} from '@/features/discovery/types';
import {
  BROWSE_FILTER_SHEET_CONFIG,
  browseStateToFilterDraft,
  filterDraftToBrowsePatch,
} from '@/features/discovery/utils/browse-filter-adapters';
import {
  parseDiscoverParams,
  serializeDiscoverParams,
  serializeDiscoverRoute,
} from '@/features/discovery/utils/discover-params';
import {
  BROWSE_DISCOVER_PARAM_KEYS,
  setDiscoveryRouteParams,
} from '@/features/navigation/discovery-route-params';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import {
  flattenDedupedSearchResultPages,
  searchResultKeyExtractor,
} from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { commonStyles } from '@/theme/theme';
import { ScrollToTopFab } from '@/features/navigation/ScrollToTopFab';
import { useFlatListScrollToTopControl } from '@/features/navigation/useFlatListScrollToTopControl';

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawParams = useLocalSearchParams();
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const listRef = useRef<FlatList>(null);
  const { fabVisible, onListScroll, scrollToTop, scrollEventThrottle } =
    useFlatListScrollToTopControl(listRef);

  const browseState = useMemo(() => parseDiscoverParams(rawParams), [rawParams]);
  const { mode, type: typeFilter, filters } = browseState;

  const browseQuery = useDiscoveryBrowse(mode, typeFilter, filters);

  const items = useMemo(
    () => flattenDedupedSearchResultPages(browseQuery.data?.pages),
    [browseQuery.data?.pages],
  );

  const filterActive = useMemo(
    () => hasActiveDiscoveryUserFilters(filters, typeFilter),
    [filters, typeFilter],
  );

  const sortActive = useMemo(
    () => hasNonDefaultDiscoverySort(filters, mode),
    [filters, mode],
  );

  const replaceBrowseState = useCallback(
    (next: DiscoveryBrowseState) => {
      setDiscoveryRouteParams(
        router,
        serializeDiscoverParams(next),
        BROWSE_DISCOVER_PARAM_KEYS,
      );
    },
    [router],
  );

  const applyFilters = useCallback(
    (nextType: DiscoveryTypeFilter, nextFilters: DiscoveryBrowseFilters) => {
      replaceBrowseState({ mode, type: nextType, filters: nextFilters });
    },
    [mode, replaceBrowseState],
  );

  const clearFilters = useCallback(() => {
    replaceBrowseState({
      mode,
      type: 'all',
      filters: clearDiscoveryUserFilters(filters, mode),
    });
  }, [filters, mode, replaceBrowseState]);

  const applySort = useCallback(
    (sort: DiscoverySort) => {
      replaceBrowseState({
        mode,
        type: typeFilter,
        filters: { ...filters, sort },
      });
    },
    [filters, mode, replaceBrowseState, typeFilter],
  );

  const openCatalogDetail = useCallback(
    (id: string, itemType: 'movie' | 'tv') => {
      prefetchCatalogDetail(queryClient, id, itemType);
      openCatalogDetailFromLibraryStack(router, id, itemType, 'discover');
    },
    [queryClient, router],
  );

  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
      if (item.type === 'person') {
        return;
      }

      openCatalogDetail(item.id, item.type);
    },
    [openCatalogDetail],
  );

  const {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch: refetchBrowse,
    isRefetching,
  } = browseQuery;

  const handleLoadMore = useCallback(() => {
    if (!shouldRequestNextInfinitePage({ hasNextPage, isFetchingNextPage })) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    void refetchBrowse();
  }, [refetchBrowse]);

  const sortOptions = useMemo(
    () =>
      DISCOVERY_SORT_OPTIONS.map((value) => ({
        value,
        label: translateDiscoverySort(value),
      })),
    [],
  );

  const listHeader = useMemo(
    () => (
      <View>
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <DetailBackButton contentInset={false} />
          <View style={[catalogBrowseListStyles.listHeader, catalogBrowseListStyles.listHeaderWithGap]}>
            <View style={catalogBrowseListStyles.titleRow}>
              <AppText variant="title" style={catalogBrowseListStyles.title}>
                {getDiscoverBrowseScreenTitle(mode, filters)}
              </AppText>
              <CatalogListActions
                sortActive={sortActive}
                filterActive={filterActive}
                sortAccessibilityLabel={t('discovery.catalogFilters.sortAction')}
                filterAccessibilityLabel={t('discovery.catalogFilters.filterAction')}
                onPressSort={() => setSortSheetVisible(true)}
                onPressFilter={() => setFilterSheetVisible(true)}
                testID="discover-browse-actions"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    ),
    [filterActive, filters, mode, sortActive, t],
  );

  const emptyState = useMemo(() => {
    if (hasActiveDiscoveryUserFilters(filters, typeFilter)) {
      return (
        <View style={catalogBrowseListStyles.emptyWithAction}>
          <SearchEmptyState
            title={t('discovery.browseScreen.noTitlesMatchFiltersTitle')}
            message={t('discovery.browseScreen.noTitlesMatchFiltersMessage')}
          />
          <AppButton title={t('common.clearFilters')} variant="secondary" onPress={clearFilters} />
        </View>
      );
    }

    return <SearchEmptyState title={t('discovery.browseScreen.noTitlesForMode')} />;
  }, [clearFilters, filters, t, typeFilter]);

  const listEmptyComponent = useMemo(() => {
    if (browseQuery.isLoading && items.length === 0) {
      return <SearchLoadingState />;
    }

    if (browseQuery.isError && items.length === 0) {
      const message = isApiError(browseQuery.error)
        ? browseQuery.error.userMessage
        : t('discovery.browseScreen.loadError');

      return (
        <View style={catalogBrowseListStyles.errorContainer}>
          <ErrorView message={message} onRetry={handleRefresh} retryLabel={t('common.tryAgain')} />
        </View>
      );
    }

    if (items.length === 0) {
      return emptyState;
    }

    return null;
  }, [browseQuery.error, browseQuery.isError, browseQuery.isLoading, emptyState, handleRefresh, items.length, t]);

  const listFooter = browseQuery.isFetchingNextPage ? (
    <View style={catalogBrowseListStyles.footerLoading}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : null;

  const renderItem = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <SearchResultCard item={item} onPress={handleResultPress} />
    ),
    [handleResultPress],
  );

  return (
    <View style={commonStyles.screen} testID="discover-browse-screen">
      <View style={styles.listHost}>
      <PlatformRefreshFlatList
        ref={listRef}
        testID="discover-browse-list"
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
        data={items}
        keyExtractor={searchResultKeyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooter}
        contentContainerStyle={
          items.length === 0
            ? catalogBrowseListStyles.listContentEmpty
            : catalogBrowseListStyles.listContent
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        onScroll={onListScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
      <ScrollToTopFab visible={fabVisible} onPress={scrollToTop} />
      </View>
      <CatalogSortSheet
        visible={sortSheetVisible}
        title={t('discovery.catalogFilters.sort')}
        closeLabel={t('common.close')}
        options={sortOptions}
        value={filters.sort ?? getDefaultSortForMode(mode)}
        onSelect={applySort}
        onClose={() => setSortSheetVisible(false)}
        testID="discover-browse-sort-sheet"
      />
      <CatalogDiscoveryFilterSheet
        visible={filterSheetVisible}
        draft={browseStateToFilterDraft(typeFilter, filters)}
        config={BROWSE_FILTER_SHEET_CONFIG}
        onClose={() => setFilterSheetVisible(false)}
        onApply={(draft) => {
          const patch = filterDraftToBrowsePatch(draft);
          applyFilters(patch.type, {
            ...filters,
            ...patch.filters,
            sort: filters.sort ?? getDefaultSortForMode(mode),
          });
        }}
        onReset={() => {
          clearFilters();
          setFilterSheetVisible(false);
        }}
        testID="discover-browse-filter-sheet"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listHost: {
    flex: 1,
  },
  headerSafeArea: {
    backgroundColor: colors.background,
  },
});
