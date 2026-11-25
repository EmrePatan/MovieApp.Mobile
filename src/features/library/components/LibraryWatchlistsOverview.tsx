import { useCallback, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
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
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { ScrollToTopFab } from '@/features/navigation/ScrollToTopFab';
import { useFlatListScrollToTopControl } from '@/features/navigation/useFlatListScrollToTopControl';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryWatchlistsOverviewProps {
  listRef?: RefObject<FlatList | null>;
  /** Scrolls with the list (profile banner + controls). */
  header?: ReactNode;
  onScrollOffset?: (offsetY: number) => void;
  /** Extra bottom padding so the last row clears the floating tab bar. */
  bottomInset?: number;
}

export function LibraryWatchlistsOverview({
  listRef,
  header = null,
  onScrollOffset,
  bottomInset = 0,
}: LibraryWatchlistsOverviewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const watchlistsQuery = useWatchlists();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const fallbackListRef = useRef<FlatList>(null);
  const effectiveListRef = listRef ?? fallbackListRef;
  const { fabVisible, onListScroll, scrollToTop, scrollEventThrottle } =
    useFlatListScrollToTopControl(effectiveListRef);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onListScroll(event);
      onScrollOffset?.(event.nativeEvent.contentOffset.y);
    },
    [onListScroll, onScrollOffset],
  );

  const watchlists = useMemo(() => {
    const items = watchlistsQuery.data ?? [];
    return [...items].sort((a, b) => b.itemCount - a.itemCount);
  }, [watchlistsQuery.data]);

  const handleOpenWatchlist = useCallback(
    (watchlistId: string) => {
      openLibraryStackScreen(router, `/watchlist/${watchlistId}`, '/(tabs)/library');
    },
    [router],
  );

  const handleCreatedWatchlist = useCallback(
    (watchlistId: string) => {
      setCreateModalVisible(false);
      openLibraryStackScreen(router, `/watchlist/${watchlistId}`, '/(tabs)/library');
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
      accessibilityLabel={t('library.watchlistsOverview.createAccessibility')}
      onPress={() => setCreateModalVisible(true)}
      style={({ pressed }) => [styles.newListAction, pressed && styles.newListPressed]}
    >
      <View style={styles.newListIconWrap}>
        <Ionicons name="add" size={20} color={colors.accent} />
      </View>
      <AppText variant="body" style={styles.newListLabel}>
        {t('common.newList')}
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
      <View style={[styles.body, styles.padded]}>
        {header}
        <LibraryLoadingState accessibilityLabel={t('common.loadingWatchlists')} />
        {createModal}
      </View>
    );
  }

  if (watchlistsQuery.isError && watchlists.length === 0) {
    return (
      <View style={[styles.body, styles.padded]}>
        {header}
        <View style={styles.centered}>
          <ErrorView
            message={t('library.watchlistsOverview.loadError')}
            onRetry={() => void watchlistsQuery.refetch()}
          />
        </View>
        {createModal}
      </View>
    );
  }

  if (watchlists.length === 0) {
    return (
      <View style={[styles.body, styles.padded]}>
        {header}
        <LibraryEmptyState
          icon="bookmark"
          title={t('library.watchlistsOverview.emptyTitle')}
          message={t('library.watchlistsOverview.emptyMessage')}
          actionLabel={t('library.watchlistsOverview.newListAction')}
          onAction={() => setCreateModalVisible(true)}
        />
        {createModal}
      </View>
    );
  }

  return (
    <View style={styles.body}>
      <FlatList
        ref={effectiveListRef}
        testID="library-watchlists-overview"
        data={watchlists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header ? <View>{header}</View> : null}
        ListFooterComponent={createListFooter}
        contentContainerStyle={[styles.listContent, { paddingBottom: spacing.xxl + bottomInset }]}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
      <ScrollToTopFab visible={fabVisible} onPress={scrollToTop} testID="library-scroll-to-top-fab" />
      {createModal}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
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
