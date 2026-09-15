import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import { flattenLibraryPages } from '../utils/flatten-library-pages';
import { getLibraryGridItemKey } from '../utils/library-item-key';
import { resolveLibraryEmptyCopy } from '../utils/library-empty-copy';
import { LibraryCategoryControl } from './LibraryCategoryControl';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryGridCard } from './LibraryGridCard';
import { LibraryMediaFilterControl } from './LibraryMediaFilterControl';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const GRID_COLUMNS = 3;
const GRID_GAP = spacing.sm;
const DEFAULT_CATEGORY: LibraryCategory = 'watching';
const DEFAULT_MEDIA_FILTER: CatalogMediaFilter = 'all';

export function LibraryHubContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<LibraryCategory>(DEFAULT_CATEGORY);
  const [mediaType, setMediaType] = useState<CatalogMediaFilter>(DEFAULT_MEDIA_FILTER);

  const libraryQuery = useLibrary(category, mediaType);

  const itemWidth = useMemo(
    () => (width - spacing.lg * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
    [width],
  );
  const itemHeight = itemWidth / layout.posterAspectRatio;

  const items = useMemo(
    () => flattenLibraryPages(libraryQuery.data?.pages ?? []),
    [libraryQuery.data?.pages],
  );

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

  const listHeader = (
    <View style={styles.header} testID="library-hub-header">
      <AppText variant="title" accessibilityRole="header">
        My Library
      </AppText>
      <AppText variant="bodySmall" muted>
        Your personal collection
      </AppText>
      <LibraryCategoryControl value={category} onChange={handleCategoryChange} />
      <LibraryMediaFilterControl value={mediaType} onChange={handleMediaTypeChange} />
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <AppText variant="title">My Library</AppText>
        <AppText variant="bodySmall" muted style={styles.signInCopy}>
          Sign in to save titles, track progress, and build your collection.
        </AppText>
        <AppButton title="Sign in" onPress={() => router.push('/(auth)/login')} />
      </View>
    );
  }

  if (libraryQuery.isLoading && items.length === 0) {
    return (
      <View style={[styles.screen, styles.screenPadding]}>
        {listHeader}
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
          <AppText variant="bodySmall" muted>Loading your library...</AppText>
        </View>
      </View>
    );
  }

  if (libraryQuery.isError && items.length === 0) {
    const message = isApiError(libraryQuery.error)
      ? libraryQuery.error.userMessage
      : 'Unable to load your library.';

    return (
      <View style={[styles.screen, styles.screenPadding]}>
        {listHeader}
        <View style={styles.centered}>
          <ErrorView message={message} onRetry={handleRefresh} retryLabel="Try Again" />
        </View>
      </View>
    );
  }

  const emptyCopy = resolveLibraryEmptyCopy(category, mediaType);

  const emptyComponent = (
    <LibraryEmptyState
      icon={emptyCopy.icon}
      title={emptyCopy.title}
      message={emptyCopy.message}
      actionLabel="Browse Discover"
      onAction={handleBrowseDiscover}
    />
  );

  return (
    <FlatList
      testID="library-grid-three-column"
      data={items}
      keyExtractor={getLibraryGridItemKey}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.row}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={emptyComponent}
      ListFooterComponent={
        libraryQuery.isFetchingNextPage ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : libraryQuery.isFetchNextPageError ? (
          <View style={styles.footerError}>
            <AppText variant="bodySmall" muted center>
              Unable to load more titles. Please try again.
            </AppText>
            <AppButton
              title="Retry"
              variant="secondary"
              onPress={() => void libraryQuery.fetchNextPage()}
            />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={libraryQuery.isRefetching && !libraryQuery.isFetchingNextPage}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
        />
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
  header: {
    paddingTop: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.md,
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
