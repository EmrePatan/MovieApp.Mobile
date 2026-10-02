import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import { useQueryClient } from '@tanstack/react-query';
import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory, LibraryItem } from '../types/library';
import { useLibrary } from '../hooks/useLibrary';
import { useLibraryHubSearchResults } from '../hooks/useLibraryHubSearchResults';
import { useLibraryHubSearch } from '../context/LibraryHubSearchContext';
import { useStableFetchedItems } from '../hooks/useStableFetchedItems';
import { flattenLibraryPages } from '../utils/flatten-library-pages';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import { getLibraryGridItemKey } from '../utils/library-item-key';
import { resolveLibraryEmptyCopy } from '../utils/library-empty-copy';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryGridCard } from './LibraryGridCard';
import { LibraryHubHeader } from './LibraryHubHeader';
import { LibraryWatchlistsOverview } from './LibraryWatchlistsOverview';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { usePrimaryTabReselectHandler } from '@/features/navigation/usePrimaryTabReselectHandler';
import { ScrollToTopFab } from '@/features/navigation/ScrollToTopFab';
import { useFlatListScrollToTopControl } from '@/features/navigation/useFlatListScrollToTopControl';
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists';

const GRID_COLUMNS = 3;
const GRID_GAP = spacing.sm;
const DEFAULT_CATEGORY: LibraryCategory = 'watching';
const DEFAULT_MEDIA_FILTER: CatalogMediaFilter = 'all';

export function LibraryHubContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<LibraryCategory>(DEFAULT_CATEGORY);
  const [mediaType, setMediaType] = useState<CatalogMediaFilter>(DEFAULT_MEDIA_FILTER);
  const { debouncedSearch, isSearchActive, clearSearch } = useLibraryHubSearch();
  const isWatchlistsCategory = category === 'watchlist';
  const effectiveMediaType = category === 'watching' ? 'all' : mediaType;
  const searchMediaType = mediaType;

  const libraryQuery = useLibrary(category, effectiveMediaType, {
    enabled: !isWatchlistsCategory && !isSearchActive,
  });
  const librarySearchQuery = useLibraryHubSearchResults(debouncedSearch, searchMediaType);
  const watchlistsQuery = useWatchlists(isWatchlistsCategory);
  const listRef = useRef<FlatList>(null);
  const { fabVisible, onListScroll, scrollToTop, scrollEventThrottle } =
    useFlatListScrollToTopControl(listRef);

  const itemWidth = useMemo(
    () => (width - spacing.lg * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
    [width],
  );
  const itemHeight = itemWidth / layout.posterAspectRatio;

  const items = useMemo(
    () => flattenLibraryPages(libraryQuery.data?.pages ?? []),
    [libraryQuery.data?.pages],
  );
  const displayItems = useStableFetchedItems(items, libraryQuery.isFetching, category);
  const searchItems = useMemo(
    () => flattenLibraryPages(librarySearchQuery.data?.pages ?? []),
    [librarySearchQuery.data?.pages],
  );
  const gridItems = isSearchActive ? searchItems : displayItems;

  const handleCategoryChange = useCallback((nextCategory: LibraryCategory) => {
    if (nextCategory === category) {
      return;
    }

    setCategory(nextCategory);
    trackProductMetric(PRODUCT_METRICS.libraryFilterSelected);
  }, [category]);

  const handleMediaTypeChange = useCallback((nextMediaType: CatalogMediaFilter) => {
    if (nextMediaType === mediaType) {
      return;
    }

    setMediaType(nextMediaType);
    trackProductMetric(PRODUCT_METRICS.libraryFilterSelected);
  }, [mediaType]);

  const handleRefresh = useCallback(() => {
    void libraryQuery.refetch();
  }, [libraryQuery]);

  const refreshLibraryHub = useCallback(() => {
    clearSearch();

    if (isWatchlistsCategory) {
      void watchlistsQuery.refetch();
      return;
    }

    if (isSearchActive) {
      void librarySearchQuery.refetch();
      return;
    }

    void libraryQuery.refetch();
  }, [
    clearSearch,
    isSearchActive,
    isWatchlistsCategory,
    libraryQuery,
    librarySearchQuery,
    watchlistsQuery,
  ]);

  usePrimaryTabReselectHandler('library', {
    scrollToTop,
    refresh: refreshLibraryHub,
  });

  const handleLoadMore = useCallback(() => {
    if (isSearchActive) {
      if (!shouldRequestNextInfinitePage(librarySearchQuery)) {
        return;
      }

      void librarySearchQuery.fetchNextPage();
      return;
    }

    if (!shouldRequestNextInfinitePage(libraryQuery)) {
      return;
    }

    void libraryQuery.fetchNextPage();
  }, [isSearchActive, libraryQuery, librarySearchQuery]);

  const handleBrowseDiscover = useCallback(() => {
    router.push('/(tabs)/discover');
  }, [router]);

  const handleItemPress = useCallback(
    (item: LibraryItem) => {
      openCatalogDetailFromTab(
        router,
        item.id,
        item.type,
        'library',
        { queryClient },
      );
    },
    [queryClient, router],
  );

  const resolveGridCategory = useCallback(
    (item: LibraryItem): LibraryCategory =>
      isSearchActive ? item.collectionStatus : category,
    [category, isSearchActive],
  );

  const renderItem = useCallback(
    ({ item }: { item: LibraryItem }) => (
      <LibraryGridCard
        item={item}
        category={resolveGridCategory(item)}
        width={itemWidth}
        height={itemHeight}
        onPress={handleItemPress}
      />
    ),
    [handleItemPress, itemHeight, itemWidth, resolveGridCategory],
  );

  const listHeader = isSearchActive ? null : (
    <LibraryHubHeader
      category={category}
      mediaType={mediaType}
      onCategoryChange={handleCategoryChange}
      onMediaTypeChange={handleMediaTypeChange}
    />
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <AppText variant="title">{t('library.hub.title')}</AppText>
        <AppText variant="bodySmall" muted style={styles.signInCopy}>
          {t('library.hub.signInCopy')}
        </AppText>
        <AppButton title={t('library.hub.signInButton')} onPress={() => router.push('/(auth)/login')} />
      </View>
    );
  }

  if (isWatchlistsCategory && !isSearchActive) {
    return <LibraryWatchlistsOverview listHeader={listHeader} listRef={listRef} />;
  }

  if (isSearchActive && librarySearchQuery.isLoading && gridItems.length === 0) {
    return (
      <View style={[styles.screen, styles.screenPadding]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
          <AppText variant="bodySmall" muted>{t('library.hub.searchLoading')}</AppText>
        </View>
      </View>
    );
  }

  if (isSearchActive && librarySearchQuery.isError && gridItems.length === 0) {
    const message = isApiError(librarySearchQuery.error)
      ? librarySearchQuery.error.userMessage
      : t('library.hub.searchError');

    return (
      <View style={[styles.screen, styles.screenPadding]}>
        <View style={styles.centered}>
          <ErrorView
            message={message}
            onRetry={() => void librarySearchQuery.refetch()}
          />
        </View>
      </View>
    );
  }

  if (!isSearchActive && libraryQuery.isLoading && displayItems.length === 0) {
    return (
      <View style={[styles.screen, styles.screenPadding]}>
        {listHeader}
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
          <AppText variant="bodySmall" muted>{t('common.loadingYourLibrary')}</AppText>
        </View>
      </View>
    );
  }

  if (!isSearchActive && libraryQuery.isError && displayItems.length === 0) {
    const message = isApiError(libraryQuery.error)
      ? libraryQuery.error.userMessage
      : t('library.hub.loadError');

    return (
      <View style={[styles.screen, styles.screenPadding]}>
        {listHeader}
        <View style={styles.centered}>
          <ErrorView message={message} onRetry={handleRefresh} />
        </View>
      </View>
    );
  }

  const emptyCopy = resolveLibraryEmptyCopy(category, effectiveMediaType);

  const emptyComponent = isSearchActive ? (
    <LibraryEmptyState
      title={t('library.hub.searchEmptyTitle', { query: debouncedSearch })}
      message={t('library.hub.searchEmptyMessage')}
    />
  ) : (
    <LibraryEmptyState
      icon={emptyCopy.icon}
      title={emptyCopy.title}
      message={emptyCopy.message}
      actionLabel={t('library.hub.browseDiscoverAction')}
      onAction={handleBrowseDiscover}
    />
  );

  const activeQuery = isSearchActive ? librarySearchQuery : libraryQuery;

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        testID="library-grid-three-column"
        data={gridItems}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        keyExtractor={getLibraryGridItemKey}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={styles.row}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        removeClippedSubviews
        ListFooterComponent={
          activeQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : activeQuery.isFetchNextPageError ? (
            <View style={styles.footerError}>
              <AppText variant="bodySmall" muted center>
                {t('common.unableToLoadMore')}
              </AppText>
              <AppButton
                title={t('common.retry')}
                variant="secondary"
                onPress={() => void activeQuery.fetchNextPage()}
              />
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        onScroll={onListScroll}
        scrollEventThrottle={scrollEventThrottle}
        initialNumToRender={layout.verticalList.initialNumToRender * GRID_COLUMNS}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch * GRID_COLUMNS}
        windowSize={layout.verticalList.windowSize}
      />
      <ScrollToTopFab visible={fabVisible} onPress={scrollToTop} testID="library-scroll-to-top-fab" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenPadding: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  signInCopy: {
    textAlign: 'center',
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerError: {
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
});
