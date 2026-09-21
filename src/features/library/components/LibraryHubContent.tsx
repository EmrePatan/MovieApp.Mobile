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
import { useStableFetchedItems } from '../hooks/useStableFetchedItems';
import { flattenLibraryPages } from '../utils/flatten-library-pages';
import { getLibraryGridItemKey } from '../utils/library-item-key';
import { getLibraryGridItemLayout } from '../utils/library-grid-layout';
import { resolveLibraryEmptyCopy } from '../utils/library-empty-copy';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryGridCard } from './LibraryGridCard';
import { LibraryHubHeader } from './LibraryHubHeader';
import { LibraryWatchlistsOverview } from './LibraryWatchlistsOverview';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { scrollFlatListToTop } from '@/features/navigation/scroll-to-top';
import { usePrimaryTabReselectHandler } from '@/features/navigation/usePrimaryTabReselectHandler';
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
  const isWatchlistsCategory = category === 'watchlist';
  const effectiveMediaType = category === 'watching' ? 'all' : mediaType;

  const libraryQuery = useLibrary(category, effectiveMediaType, {
    enabled: !isWatchlistsCategory,
  });
  const watchlistsQuery = useWatchlists(isWatchlistsCategory);
  const listRef = useRef<FlatList>(null);

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

  const scrollLibraryToTop = useCallback(() => {
    scrollFlatListToTop(listRef);
  }, []);

  const refreshLibraryHub = useCallback(() => {
    if (isWatchlistsCategory) {
      void watchlistsQuery.refetch();
      return;
    }

    void libraryQuery.refetch();
  }, [isWatchlistsCategory, libraryQuery, watchlistsQuery]);

  usePrimaryTabReselectHandler('library', {
    scrollToTop: scrollLibraryToTop,
    refresh: refreshLibraryHub,
  });

  const handleLoadMore = useCallback(() => {
    if (
      !libraryQuery.hasNextPage ||
      libraryQuery.isFetchingNextPage ||
      libraryQuery.isFetching
    ) {
      return;
    }

    void libraryQuery.fetchNextPage();
  }, [libraryQuery]);

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

  const renderItem = useCallback(
    ({ item }: { item: LibraryItem }) => (
      <LibraryGridCard
        item={item}
        category={category}
        width={itemWidth}
        height={itemHeight}
        onPress={handleItemPress}
      />
    ),
    [category, handleItemPress, itemHeight, itemWidth],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<LibraryItem> | null | undefined, index: number) =>
      getLibraryGridItemLayout(itemHeight, category, GRID_COLUMNS, index),
    [category, itemHeight],
  );

  const listHeader = (
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

  if (isWatchlistsCategory) {
    return <LibraryWatchlistsOverview listHeader={listHeader} listRef={listRef} />;
  }

  if (libraryQuery.isLoading && displayItems.length === 0) {
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

  if (libraryQuery.isError && displayItems.length === 0) {
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

  const emptyComponent = (
    <LibraryEmptyState
      icon={emptyCopy.icon}
      title={emptyCopy.title}
      message={emptyCopy.message}
      actionLabel={t('library.hub.browseDiscoverAction')}
      onAction={handleBrowseDiscover}
    />
  );

  return (
    <FlatList
      ref={listRef}
      testID="library-grid-three-column"
      data={displayItems}
      keyExtractor={getLibraryGridItemKey}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.row}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={emptyComponent}
      removeClippedSubviews
      ListFooterComponent={
        libraryQuery.isFetchingNextPage ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : libraryQuery.isFetchNextPageError ? (
          <View style={styles.footerError}>
            <AppText variant="bodySmall" muted center>
              {t('common.unableToLoadMore')}
            </AppText>
            <AppButton
              title={t('common.retry')}
              variant="secondary"
              onPress={() => void libraryQuery.fetchNextPage()}
            />
          </View>
        ) : null
      }
      contentContainerStyle={styles.listContent}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      initialNumToRender={layout.verticalList.initialNumToRender * GRID_COLUMNS}
      maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch * GRID_COLUMNS}
      windowSize={layout.verticalList.windowSize}
    />
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
