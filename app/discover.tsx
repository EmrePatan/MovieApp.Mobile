import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { catalogItemKeyExtractor } from '@/features/catalog/utils/catalog-list-keys';
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
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

function getTypeLabel(type: DiscoveryTypeFilter): string | null {
  if (type === 'all') {
    return null;
  }

  return DISCOVERY_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? null;
}

export default function DiscoverScreen() {
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
      router.push(buildCatalogDetailRoute(id, itemType));
    },
    [queryClient, router],
  );

  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
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

    return DISCOVERY_SORT_OPTIONS.find((option) => option.value === filters.sort)?.label ?? null;
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

  const renderResult = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <SearchResultCard item={item} onPress={handleResultPress} />
    ),
    [handleResultPress],
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
                ? `Filters, ${activeFilterCount} active`
                : 'Filters'
            }
            onPress={() => setFilterSheetVisible(true)}
            style={({ pressed }) => [styles.filtersButton, pressed && styles.pressed]}
          >
            <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
            <AppText variant="bodySmall" style={styles.filtersButtonText}>
              Filters
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
    [activeFilterChips, activeFilterCount, mode],
  );

  const emptyState = useMemo(() => {
    if (hasActiveDiscoveryFilters(filters, mode, typeFilter)) {
      return (
        <View style={styles.emptyWithAction}>
          <SearchEmptyState
            title="No titles match your filters"
            message="Try adjusting or clearing your filters."
          />
          <AppButton title="Clear filters" variant="secondary" onPress={clearFilters} />
        </View>
      );
    }

    return <SearchEmptyState title="No titles found for this browse mode." />;
  }, [clearFilters, filters, mode, typeFilter]);

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
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <SearchLoadingState />
        {filterSheet}
      </SafeAreaView>
    );
  }

  if (browseQuery.isError && items.length === 0) {
    const message = isApiError(browseQuery.error)
      ? browseQuery.error.userMessage
      : 'Unable to load discovery content. Please try again.';

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView message={message} onRetry={handleRefresh} retryLabel="Try Again" />
        </View>
        {filterSheet}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={catalogItemKeyExtractor}
        renderItem={renderResult}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          browseQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
      />
      {filterSheet}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
