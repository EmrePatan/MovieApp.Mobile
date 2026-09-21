import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  translateDiscoverySort,
  translateDiscoveryTypeFilter,
} from '@/i18n/catalog-labels';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';
import {
  DISCOVER_CHROME_PROBE_STAGE,
  DISCOVER_USE_CHROME_PROBE,
  DiscoverChromeProbe,
} from '@/debug/discover-chrome-probe';
import {
  DISCOVER_ROUTE_PROBE_STAGE,
  DiscoverRouteProbe,
} from '@/debug/discover-route-probe';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { commonStyles } from '@/theme/theme';

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
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const browseState = useMemo(() => parseDiscoverParams(rawParams), [rawParams]);
  const { mode, type: typeFilter, filters } = browseState;

  const genresQuery = useGenres();
  const browseQuery = useDiscoveryBrowse(mode, typeFilter, filters);

  const items = useMemo(
    () => browseQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [browseQuery.data?.pages],
  );

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

  const headerShell = useMemo(
    () => (
      <View>
        <SafeAreaView edges={['top']} style={styles.headerSafeArea} />
      </View>
    ),
    [],
  );

  const headerWithTitle = useMemo(
    () => (
      <View>
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <DetailBackButton contentInset={false} />
          <View style={styles.header}>
            <AppText variant="title">{getDiscoverTitle(mode)}</AppText>
          </View>
        </SafeAreaView>
      </View>
    ),
    [mode],
  );

  const listHeader = useMemo(
    () => (
      <View>
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <DetailBackButton contentInset={false} />
          <View style={styles.header}>
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
        </SafeAreaView>
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

  const listEmptyComponent = useMemo(() => {
    if (browseQuery.isLoading && items.length === 0) {
      return <SearchLoadingState />;
    }

    if (browseQuery.isError && items.length === 0) {
      const message = isApiError(browseQuery.error)
        ? browseQuery.error.userMessage
        : t('discovery.browseScreen.loadError');

      return (
        <View style={styles.errorContainer}>
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
    <View style={styles.footerLoading}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : null;

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

  const renderItem = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <SearchResultCard item={item} onPress={handleResultPress} />
    ),
    [handleResultPress],
  );

  const productionScreen = (
    <View style={commonStyles.screen} testID="discover-browse-screen">
      <PlatformRefreshFlatList
        testID="discover-browse-list"
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
        data={items}
        keyExtractor={searchResultKeyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooter}
        contentContainerStyle={items.length === 0 ? styles.emptyListContent : styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
      {filterSheetVisible ? filterSheet : null}
    </View>
  );

  if (__DEV__ && Platform.OS === 'android') {
    if (DISCOVER_USE_CHROME_PROBE) {
      return (
        <DiscoverChromeProbe
          stage={DISCOVER_CHROME_PROBE_STAGE}
          items={items}
          onPress={handleResultPress}
          headerShell={headerShell}
          headerWithTitle={headerWithTitle}
          headerFull={listHeader}
          listEmptyComponent={listEmptyComponent}
          listFooter={listFooter}
          contentContainerStyle={styles.listContent}
          emptyContentContainerStyle={styles.emptyListContent}
          refreshing={isRefetching && !isFetchingNextPage}
          refreshControl={
            <MovieAppRefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={handleRefresh}
            />
          }
          onEndReached={handleLoadMore}
          initialNumToRender={layout.verticalList.initialNumToRender}
          maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
          windowSize={layout.verticalList.windowSize}
          productionScreen={productionScreen}
        />
      );
    }

    return (
      <DiscoverRouteProbe
        stage={DISCOVER_ROUTE_PROBE_STAGE}
        production={productionScreen}
        items={items}
        listHeader={listHeader}
        onPress={handleResultPress}
      />
    );
  }

  return productionScreen;
}

const styles = StyleSheet.create({
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  header: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
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
  listContent: {
    paddingBottom: spacing.xxl,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
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
    paddingVertical: spacing.xl,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
