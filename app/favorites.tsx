import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { useFavoritesItems } from '@/features/favorites/hooks/useFavoritesItems';
import { useRemoveFavoriteMutation } from '@/features/favorites/hooks/useFavoriteMutations';
import { flattenFavoritesPages } from '@/features/favorites/utils/favorite-library-items';
import { LibraryContentCard } from '@/features/watchlists/components/LibraryContentCard';
import { WatchlistEmptyState } from '@/features/watchlists/components/WatchlistEmptyState';
import { WatchlistLoadingState } from '@/features/watchlists/components/WatchlistLoadingState';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const favoritesQuery = useFavoritesItems();
  const removeFavorite = useRemoveFavoriteMutation();
  const [removingItemKey, setRemovingItemKey] = useState<string | null>(null);
  const [removeFeedback, setRemoveFeedback] = useState<string | null>(null);

  const items = useMemo(
    () => flattenFavoritesPages(favoritesQuery.data?.pages ?? []),
    [favoritesQuery.data?.pages],
  );

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleExplore = useCallback(() => {
    router.push('/discover');
  }, [router]);

  const handleItemPress = useCallback(
    (item: LibraryItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  const handleRemoveItem = useCallback(
    (item: LibraryItem) => {
      if (removeFavorite.isPending) {
        return;
      }

      const itemKey = `${item.type}-${item.id}`;
      setRemovingItemKey(itemKey);
      removeFavorite.mutate(
        { contentType: item.type, contentId: item.id },
        {
          onError: (error) => {
            setRemoveFeedback(
              isApiError(error)
                ? error.userMessage
                : 'Could not remove this favorite. Please try again.',
            );
          },
          onSettled: () => {
            setRemovingItemKey(null);
          },
        },
      );
    },
    [removeFavorite],
  );

  const handleLoadMore = useCallback(() => {
    if (
      !favoritesQuery.hasNextPage ||
      favoritesQuery.isFetchingNextPage ||
      favoritesQuery.isFetching
    ) {
      return;
    }

    void favoritesQuery.fetchNextPage();
  }, [favoritesQuery]);

  const handleRefresh = useCallback(() => {
    void favoritesQuery.refetch();
  }, [favoritesQuery]);

  const handleRetryNextPage = useCallback(() => {
    void favoritesQuery.fetchNextPage();
  }, [favoritesQuery]);

  const renderItem = useCallback(
    ({ item }: { item: LibraryItem }) => (
      <LibraryContentCard
        item={item}
        isRemoving={removingItemKey === `${item.type}-${item.id}`}
        removeAccessibilityLabel="favorites"
        onPress={handleItemPress}
        onRemove={handleRemoveItem}
      />
    ),
    [handleItemPress, handleRemoveItem, removingItemKey],
  );

  const listHeader = (
    <View style={styles.header}>
      <DetailBackButton />
      <AppText variant="title">Favorites</AppText>
      <AppText variant="bodySmall" muted>
        Movies and TV shows you have saved
      </AppText>
      <FeedbackMessage
        message={removeFeedback}
        tone="error"
        onDismiss={() => setRemoveFeedback(null)}
      />
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <WatchlistEmptyState
          title="Sign in to view your favorites"
          message="Movies and TV shows you favorite will appear here after you sign in."
          actionLabel="Sign In"
          onAction={handleSignIn}
        />
      </SafeAreaView>
    );
  }

  if (favoritesQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <WatchlistLoadingState accessibilityLabel="Loading favorites" />
      </SafeAreaView>
    );
  }

  if (favoritesQuery.isError && items.length === 0) {
    const message = isApiError(favoritesQuery.error)
      ? favoritesQuery.error.userMessage
      : 'Unable to load favorites. Please try again.';

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message={message}
            onRetry={() => void favoritesQuery.refetch()}
            retryLabel="Retry"
          />
        </View>
      </SafeAreaView>
    );
  }

  const paginationErrorMessage = favoritesQuery.isFetchNextPageError
    ? isApiError(favoritesQuery.error)
      ? favoritesQuery.error.userMessage
      : 'Unable to load more favorites. Please try again.'
    : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <WatchlistEmptyState
            title="No favorites yet"
            message="Movies and TV shows you favorite will appear here."
            actionLabel="Explore"
            onAction={handleExplore}
          />
        }
        ListFooterComponent={
          favoritesQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : favoritesQuery.isFetchNextPageError ? (
            <View style={styles.footerError}>
              <AppText variant="bodySmall" muted center>
                {paginationErrorMessage}
              </AppText>
              <AppButton title="Retry" variant="secondary" onPress={handleRetryNextPage} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={favoritesQuery.isRefetching && !favoritesQuery.isFetchingNextPage}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
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
  footerError: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
});
