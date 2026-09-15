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
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { catalogItemKeyExtractor } from '@/features/catalog/utils/catalog-list-keys';
import { AdvancedDiscoverFilterSheet } from '@/features/discovery/components/AdvancedDiscoverFilterSheet';
import {
  ADVANCED_DISCOVER_MEDIA_OPTIONS,
  ADVANCED_DISCOVER_SORT_OPTIONS,
  countActiveAdvancedDiscoverFilters,
  createDefaultAdvancedDiscoverFilters,
  hasActiveAdvancedDiscoverFilters,
  hasStreamingAvailabilityFilters,
  resolveAdvancedDiscoverWatchRegion,
  type AdvancedDiscoverFilters,
  type AdvancedDiscoverMediaType,
  type AdvancedDiscoverState,
} from '@/features/discovery/advanced-discover-types';
import { useAdvancedDiscover } from '@/features/discovery/hooks/useAdvancedDiscover';
import {
  parseAdvancedDiscoverParams,
  serializeAdvancedDiscoverParams,
  serializeAdvancedDiscoverRoute,
} from '@/features/discovery/utils/advanced-discover-params';
import {
  ADVANCED_DISCOVER_PARAM_KEYS,
  setDiscoveryRouteParams,
} from '@/features/navigation/discovery-route-params';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

function getMediaTypeLabel(mediaType: AdvancedDiscoverMediaType): string {
  return (
    ADVANCED_DISCOVER_MEDIA_OPTIONS.find((option) => option.value === mediaType)?.label ??
    'Movies'
  );
}

export default function AdvancedDiscoverScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawParams = useLocalSearchParams();
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const { region: userRegion } = useRegionalPreference();

  const discoverState = useMemo(() => parseAdvancedDiscoverParams(rawParams), [rawParams]);
  const { mediaType, filters } = discoverState;

  const discoverQuery = useAdvancedDiscover(mediaType, filters);

  const items = useMemo(
    () => discoverQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [discoverQuery.data?.pages],
  );

  const activeFilterCount = useMemo(
    () => countActiveAdvancedDiscoverFilters(filters, mediaType),
    [filters, mediaType],
  );

  const currentRoute = useMemo(
    () => serializeAdvancedDiscoverRoute(discoverState),
    [discoverState],
  );

  const replaceDiscoverState = useCallback(
    (next: AdvancedDiscoverState) => {
      setDiscoveryRouteParams(
        router,
        serializeAdvancedDiscoverParams(next),
        ADVANCED_DISCOVER_PARAM_KEYS,
      );
    },
    [router],
  );

  const applyFilters = useCallback(
    (nextMediaType: AdvancedDiscoverMediaType, nextFilters: AdvancedDiscoverFilters) => {
      replaceDiscoverState({ mediaType: nextMediaType, filters: nextFilters });
    },
    [replaceDiscoverState],
  );

  const clearFilters = useCallback(() => {
    replaceDiscoverState({
      mediaType: 'movie',
      filters: createDefaultAdvancedDiscoverFilters(),
    });
  }, [replaceDiscoverState]);

  const openCatalogDetail = useCallback(
    (id: string, itemType: 'movie' | 'tv') => {
      prefetchCatalogDetail(queryClient, id, itemType);
      const contextualWatchRegion = hasStreamingAvailabilityFilters(filters)
        ? resolveAdvancedDiscoverWatchRegion(filters, userRegion)
        : undefined;

      openCatalogDetailFromLibraryStack(router, id, itemType, 'discover', {
        libraryReturnHref: currentRoute,
        watchRegion: contextualWatchRegion ?? undefined,
      });
    },
    [currentRoute, filters, queryClient, router, userRegion],
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
    refetch: refetchDiscover,
    isRefetching,
  } = discoverQuery;

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isFetching) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    void refetchDiscover();
  }, [refetchDiscover]);

  const sortLabel = useMemo(() => {
    if (!filters.sort || filters.sort === 'popularity_desc') {
      return null;
    }

    return ADVANCED_DISCOVER_SORT_OPTIONS.find((option) => option.value === filters.sort)?.label ??
      null;
  }, [filters.sort]);

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
        <AppText variant="title">Advanced Discover</AppText>
        <AppText variant="bodySmall" muted>
          {getMediaTypeLabel(mediaType)}
          {sortLabel ? ` · ${sortLabel}` : ''}
        </AppText>
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
      </View>
    ),
    [activeFilterCount, mediaType, sortLabel],
  );

  const emptyState = useMemo(() => {
    if (hasActiveAdvancedDiscoverFilters(filters, mediaType)) {
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

    return <SearchEmptyState title="No titles found." />;
  }, [clearFilters, filters, mediaType]);

  const filterSheet = (
    <AdvancedDiscoverFilterSheet
      visible={filterSheetVisible}
      mediaType={mediaType}
      filters={filters}
      onClose={() => setFilterSheetVisible(false)}
      onApply={applyFilters}
      onClear={clearFilters}
    />
  );

  if (discoverQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <SearchLoadingState />
        {filterSheet}
      </SafeAreaView>
    );
  }

  if (discoverQuery.isError && items.length === 0) {
    const message = isApiError(discoverQuery.error)
      ? discoverQuery.error.userMessage
      : 'Unable to load discovery results. Please try again.';

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
          discoverQuery.isFetchingNextPage ? (
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
