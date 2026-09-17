import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { CreateWatchlistModal } from '@/features/watchlists/components/CreateWatchlistModal';
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists';
import type { WatchlistSummaryResponse } from '@/features/watchlists/types';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryLoadingState } from './LibraryLoadingState';
import { LibraryWatchlistCard } from './LibraryWatchlistCard';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryWatchlistsOverviewProps {
  listHeader: ReactNode;
}

export function LibraryWatchlistsOverview({ listHeader }: LibraryWatchlistsOverviewProps) {
  const router = useRouter();
  const watchlistsQuery = useWatchlists();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const watchlists = useMemo(
    () => watchlistsQuery.data ?? [],
    [watchlistsQuery.data],
  );

  const handleOpenWatchlist = useCallback(
    (watchlistId: string) => {
      router.push(`/watchlist/${watchlistId}`);
    },
    [router],
  );

  const handleCreatedWatchlist = useCallback(
    (watchlistId: string) => {
      setCreateModalVisible(false);
      router.push(`/watchlist/${watchlistId}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: WatchlistSummaryResponse }) => (
      <LibraryWatchlistCard watchlist={item} onPress={handleOpenWatchlist} />
    ),
    [handleOpenWatchlist],
  );

  const createListFooter = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create new watchlist"
      onPress={() => setCreateModalVisible(true)}
      style={({ pressed }) => [styles.newListAction, pressed && styles.newListPressed]}
    >
      <View style={styles.newListIconWrap}>
        <Ionicons name="add" size={20} color={colors.accent} />
      </View>
      <AppText variant="body" style={styles.newListLabel}>
        New List
      </AppText>
    </Pressable>
  );

  const createModal = (
    <CreateWatchlistModal
      visible={createModalVisible}
      onClose={() => setCreateModalVisible(false)}
      onCreated={handleCreatedWatchlist}
    />
  );

  if (watchlistsQuery.isLoading && watchlists.length === 0) {
    return (
      <View style={styles.screen}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel="Loading watchlists" />
        {createModal}
      </View>
    );
  }

  if (watchlistsQuery.isError && watchlists.length === 0) {
    return (
      <View style={styles.screen}>
        {listHeader}
        <View style={styles.centered}>
          <ErrorView
            message="Unable to load watchlists. Please try again."
            onRetry={() => void watchlistsQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
        {createModal}
      </View>
    );
  }

  if (watchlists.length === 0) {
    return (
      <View style={styles.screen}>
        {listHeader}
        <LibraryEmptyState
          icon="bookmark"
          title="You don't have any watchlists yet"
          message="Create a list to save movies and TV shows you want to watch."
          actionLabel="New List"
          onAction={() => setCreateModalVisible(true)}
        />
        {createModal}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        testID="library-watchlists-overview"
        data={watchlists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {listHeader}
          </View>
        }
        ListFooterComponent={createListFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={watchlistsQuery.isRefetching}
            onRefresh={() => void watchlistsQuery.refetch()}
            tintColor={colors.accent}
          />
        }
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
      {createModal}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listHeader: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  newListAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    borderStyle: 'dashed',
    backgroundColor: colors.accentTint12,
  },
  newListPressed: {
    opacity: 0.85,
  },
  newListIconWrap: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint18,
  },
  newListLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
});
