import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  translateAdvancedDiscoverMediaType,
  translateAdvancedDiscoverSort,
  translateAdvancedDiscoverTitle,
} from '@/i18n/catalog-labels';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { mergeFlatListStyle } from '@/components/layout/flat-list-layout';
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
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

function getMediaTypeLabel(mediaType: AdvancedDiscoverMediaType): string {
  return translateAdvancedDiscoverMediaType(mediaType);
}

export default function AdvancedDiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawParams = useLocalSearchParams();
  const { region: userRegion } = useRegionalPreference();
  useTrackProductMetricOnFocus(PRODUCT_METRICS.advancedDiscoverOpened);

  const discoverState = useMemo(() => parseAdvancedDiscoverParams(rawParams), [rawParams]);
  const { mediaType, filters } = discoverState;
  const hasRouteFilters = useMemo(
    () => hasActiveAdvancedDiscoverFilters(filters, mediaType),
    [filters, mediaType],
  );
  const [hasAppliedFilters, setHasAppliedFilters] = useState(hasRouteFilters);
  const [filterSheetVisible, setFilterSheetVisible] = useState(!hasRouteFilters);
  const shouldFetchResults = hasAppliedFilters || hasRouteFilters;

  const discoverQuery = useAdvancedDiscover(mediaType, filters, undefined, shouldFetchResults);

  const items = useMemo(() => {
    if (!shouldFetchResults) {
      return [];
    }

    return discoverQuery.data?.pages.flatMap((page) => page.items) ?? [];
  }, [discoverQuery.data?.pages, shouldFetchResults]);

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
      setHasAppliedFilters(true);
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

    return translateAdvancedDiscoverSort(filters.sort);
  }, [filters.sort]);

  const renderResult = useCallback(
    ({ item }: { item: SearchResultItem }) => (
      <SearchResultCard item={item} onPress={handleResultPress} />
    ),
    [handleResultPress],
  );

  const pageHeader = useMemo(
    () => (
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {translateAdvancedDiscoverTitle()}
        </AppText>
        <AppText variant="bodySmall" muted>
          {getMediaTypeLabel(mediaType)}
          {sortLabel ? ` · ${sortLabel}` : ''}
        </AppText>
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
      </View>
    ),
    [activeFilterCount, mediaType, sortLabel, t],
  );

  const topBar = (
    <View style={styles.topBar}>
      <DetailBackButton />
    </View>
  );

  const emptyState = useMemo(() => {
    if (!shouldFetchResults) {
      return null;
    }

    if (hasActiveAdvancedDiscoverFilters(filters, mediaType)) {
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

    return <SearchEmptyState title={t('discovery.advancedDiscover.noTitlesFound')} />;
  }, [clearFilters, filters, mediaType, shouldFetchResults, t]);

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

  if (shouldFetchResults && discoverQuery.isLoading && items.length === 0) {
    return (
      <StackListScreen topBar={topBar}>
        <View style={styles.listContent}>
          {pageHeader}
          <SearchLoadingState />
        </View>
        {filterSheet}
      </StackListScreen>
    );
  }

  if (shouldFetchResults && discoverQuery.isError && items.length === 0) {
    const message = isApiError(discoverQuery.error)
      ? discoverQuery.error.userMessage
      : t('discovery.advancedDiscover.loadError');

    return (
      <StackListScreen topBar={topBar}>
        <View style={styles.listContent}>
          {pageHeader}
          <View style={styles.errorContainer}>
            <ErrorView message={message} onRetry={handleRefresh} retryLabel={t('common.tryAgain')} />
          </View>
        </View>
        {filterSheet}
      </StackListScreen>
    );
  }

  return (
    <StackListScreen topBar={topBar}>
      <FlatList
        data={items}
        keyExtractor={catalogItemKeyExtractor}
        renderItem={renderResult}
        ListHeaderComponent={pageHeader}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          discoverQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
        refreshControl={
          <MovieAppRefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
          />
        }
        style={mergeFlatListStyle()}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
      />
      {filterSheet}
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  filtersRow: {
    paddingTop: spacing.xs,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    minHeight: 44,
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  emptyWithAction: {
    gap: spacing.md,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
