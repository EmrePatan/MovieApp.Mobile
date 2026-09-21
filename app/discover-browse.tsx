import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  translateDiscoverySort,
  translateDiscoveryTypeFilter,
} from '@/i18n/catalog-labels';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { CatalogScreenShell } from '@/components/layout/CatalogScreenShell';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import {
  ActiveFilterChips,
  buildActiveFilterChips,
} from '@/features/discovery/components/ActiveFilterChips';
import { DiscoverFilterSheet } from '@/features/discovery/components/DiscoverFilterSheet';
import { useDiscoveryBrowse } from '@/features/discovery/hooks/useDiscoveryBrowse';
import { useGenres } from '@/features/discovery/hooks/useGenres';
import {
  countActiveDiscoveryFilters,
  createDefaultDiscoveryFilters,
  DISCOVERY_SORT_OPTIONS,
  DISCOVERY_TYPE_OPTIONS,
  getDefaultSortForMode,
  getDiscoverTitle,
  hasActiveDiscoveryFilters,
  type DiscoveryBrowseFilters,
  type DiscoveryBrowseState,
  type DiscoveryTypeFilter,
} from '@/features/discovery/types';
import {
  parseDiscoverParams,
  serializeDiscoverRoute,
} from '@/features/discovery/utils/discover-params';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchMappedResultsScroll } from '@/features/search/components/SearchMappedResultsScroll';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';
import {
  useNavigationDiagnostics,
  useScreenRenderTrace,
} from '@/debug/navigation-diagnostics';
import { logRouteLayoutMeta, useRouteLayoutContext } from '@/debug/route-layout-probe';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

function getTypeLabel(type: DiscoveryTypeFilter): string | null {
  if (type === 'all') {
    return null;
  }

  return translateDiscoveryTypeFilter(type);
}

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawParams = useLocalSearchParams();
  const segments = useSegments();
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const browseState = useMemo(() => parseDiscoverParams(rawParams), [rawParams]);
  const { mode, type: typeFilter, filters } = browseState;
  const route = useRouteLayoutContext();
  const layoutScope = mode === 'trending' ? 'trending-see-all' : `discover-browse-${mode}`;

  const genresQuery = useGenres();
  const browseQuery = useDiscoveryBrowse(mode, typeFilter, filters);

  const items = useMemo(
    () => browseQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [browseQuery.data?.pages],
  );

  useNavigationDiagnostics('discover-browse', {
    mode,
    typeFilter,
    itemCount: items.length,
    isLoading: browseQuery.isLoading,
    isError: browseQuery.isError,
    isFetching: browseQuery.isFetching,
  });

  const listMounted = items.length > 0 || !browseQuery.isLoading;

  useScreenRenderTrace('discover-browse', {
    pathname: `/${segments.join('/')}`,
    mode,
    layoutScope,
    itemCount: items.length,
    bodyKind: listMounted ? 'scroll-view' : 'placeholder',
    shellKind: 'catalog-screen-shell',
    listMounted,
  });

  useEffect(() => {
    logRouteLayoutMeta(layoutScope, route, {
      shell: 'CatalogScreenShell',
      renderer: 'ScrollView',
      itemComponent: 'SearchResultCard',
      dataCount: items.length,
      headerPlacement: 'sibling-above-body',
      nestedInStackListScreen: false,
      navigation: 'openLibraryStackScreen -> router.push(/discover-browse)',
    });
  }, [items.length, layoutScope, mode, route]);

  const activeFilterCount = useMemo(
    () => countActiveDiscoveryFilters(filters, mode, typeFilter),
    [filters, mode, typeFilter],
  );

  const replaceBrowseState = useCallback(
    (next: DiscoveryBrowseState) => {
      router.replace(serializeDiscoverRoute(next));
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
      filters: createDefaultDiscoveryFilters(mode),
    });
  }, [mode, replaceBrowseState]);

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
    isFetching,
    fetchNextPage,
    refetch: refetchBrowse,
    isRefetching,
  } = browseQuery;

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isFetching) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    void refetchBrowse();
  }, [refetchBrowse]);

  const sortLabel = useMemo(() => {
    if (!filters.sort || filters.sort === getDefaultSortForMode(mode)) {
      return null;
    }

    return translateDiscoverySort(filters.sort);
  }, [filters.sort, mode]);

  const activeFilterChips = useMemo(
    () =>
      buildActiveFilterChips(
        {
          typeLabel: getTypeLabel(typeFilter),
          genreIds: filters.genreIds,
          year: filters.year,
          minRating: filters.minRating,
          language: filters.language,
          sortLabel,
        },
        genresQuery.data ?? [],
        {
          onRemoveType: () => replaceBrowseState({ mode, type: 'all', filters }),
          onRemoveGenre: (genreId) =>
            replaceBrowseState({
              mode,
              type: typeFilter,
              filters: {
                ...filters,
                genreIds: filters.genreIds.filter((id) => id !== genreId),
              },
            }),
          onRemoveYear: () =>
            replaceBrowseState({ mode, type: typeFilter, filters: { ...filters, year: null } }),
          onRemoveMinRating: () =>
            replaceBrowseState({
              mode,
              type: typeFilter,
              filters: { ...filters, minRating: null },
            }),
          onRemoveLanguage: () =>
            replaceBrowseState({
              mode,
              type: typeFilter,
              filters: { ...filters, language: null },
            }),
          onRemoveSort: () =>
            replaceBrowseState({
              mode,
              type: typeFilter,
              filters: { ...filters, sort: getDefaultSortForMode(mode) },
            }),
        },
      ),
    [filters, genresQuery.data, mode, replaceBrowseState, sortLabel, typeFilter],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title">{getDiscoverTitle(mode)}</AppText>
        <View style={styles.filtersRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              activeFilterCount > 0
                ? t('common.filtersActive', { count: activeFilterCount })
                : t('discovery.browseScreen.filters')
            }
            onPress={() => setFilterSheetVisible(true)}
            style={({ pressed }) => [styles.filtersButton, pressed && styles.pressed]}
          >
            <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
            <AppText variant="bodySmall" style={styles.filtersButtonText}>
              {t('discovery.browseScreen.filters')}
            </AppText>
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadge}>
                <AppText variant="caption" style={styles.filterBadgeText}>
                  {activeFilterCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        </View>
        <ActiveFilterChips chips={activeFilterChips} />
      </View>
    ),
    [activeFilterChips, activeFilterCount, mode, t],
  );

  const emptyState = useMemo(() => {
    if (hasActiveDiscoveryFilters(filters, mode, typeFilter)) {
      return (
        <View style={styles.emptyWithAction}>
          <SearchEmptyState
            title={t('discovery.browseScreen.noTitlesMatchFiltersTitle')}
            message={t('discovery.browseScreen.noTitlesMatchFiltersMessage')}
          />
          <AppButton title={t('common.clearFilters')} variant="secondary" onPress={clearFilters} />
        </View>
      );
    }

    return <SearchEmptyState title={t('discovery.browseScreen.noTitlesForMode')} />;
  }, [clearFilters, filters, mode, t, typeFilter]);

  const filterSheet = (
    <DiscoverFilterSheet
      visible={filterSheetVisible}
      mode={mode}
      type={typeFilter}
      filters={filters}
      onClose={() => setFilterSheetVisible(false)}
      onApply={applyFilters}
      onClear={clearFilters}
    />
  );

  if (browseQuery.isLoading && items.length === 0) {
    return (
      <CatalogScreenShell layoutScope={layoutScope} testID="discover-browse-screen" header={listHeader}>
        <SearchLoadingState />
        {filterSheetVisible ? filterSheet : null}
      </CatalogScreenShell>
    );
  }

  if (browseQuery.isError && items.length === 0) {
    const message = isApiError(browseQuery.error)
      ? browseQuery.error.userMessage
      : t('discovery.browseScreen.loadError');

    return (
      <CatalogScreenShell layoutScope={layoutScope} testID="discover-browse-screen" header={listHeader}>
        <View style={styles.errorContainer}>
          <ErrorView message={message} onRetry={handleRefresh} retryLabel={t('common.tryAgain')} />
        </View>
        {filterSheetVisible ? filterSheet : null}
      </CatalogScreenShell>
    );
  }

  const resultsFooter = browseQuery.isFetchingNextPage ? (
    <View style={styles.footerLoading}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : null;

  const resultsBody =
    items.length === 0 ? (
      emptyState
    ) : (
      <SearchMappedResultsScroll
        layoutScope={layoutScope}
        testID="discover-browse-scroll"
        style={styles.resultsScroll}
        items={items}
        keyExtractor={searchResultKeyExtractor}
        onPress={handleResultPress}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <MovieAppRefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
          />
        }
        footer={resultsFooter}
        onEndReached={handleLoadMore}
      />
    );

  return (
    <CatalogScreenShell layoutScope={layoutScope} testID="discover-browse-screen" header={listHeader}>
      {resultsBody}
      {filterSheetVisible ? filterSheet : null}
    </CatalogScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  filtersRow: {
    paddingHorizontal: 0,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filtersButtonText: {
    fontWeight: '600',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  filterBadgeText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  resultsScroll: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  emptyWithAction: {
    gap: spacing.md,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
