import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { normalizeRouteParam } from '@/features/navigation/normalize-route-param';
import { LibraryEmptyState } from '@/features/library/components/LibraryEmptyState';
import { LibraryGridCard } from '@/features/library/components/LibraryGridCard';
import { LibraryWatchlistDetailHeader } from '@/features/library/components/LibraryWatchlistDetailHeader';
import { mapWatchlistItemToLibraryGridItem } from '@/features/library/utils/map-watchlist-item-to-grid-item';
import { resolveLibraryEmptyCopy } from '@/features/library/utils/library-empty-copy';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import {
  useSocialProfileWatchlistItems,
  useSocialProfileWatchlists,
} from '@/features/social/hooks/useSocialQueries';
import { mapWatchlistPageToLibraryItems } from '@/features/watchlists/utils/library-items';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const GRID_COLUMNS = 3;
const GRID_GAP = spacing.sm;

/** Read-only view of another user's watchlist, reached from their profile library. */
export default function SocialProfileWatchlistScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ userId: string | string[]; watchlistId: string | string[] }>();
  const userId = useMemo(() => normalizeRouteParam(params.userId), [params.userId]);
  const watchlistId = useMemo(() => normalizeRouteParam(params.watchlistId), [params.watchlistId]);

  const watchlistsQuery = useSocialProfileWatchlists(userId);
  const itemsQuery = useSocialProfileWatchlistItems(userId, watchlistId);

  const watchlist = useMemo(
    () => watchlistsQuery.data?.find((entry) => entry.id === watchlistId) ?? null,
    [watchlistId, watchlistsQuery.data],
  );

  const gridItems = useMemo(
    () =>
      itemsQuery.data
        ? mapWatchlistPageToLibraryItems(itemsQuery.data).map(mapWatchlistItemToLibraryGridItem)
        : [],
    [itemsQuery.data],
  );

  const cardWidth = (width - spacing.lg * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const cardHeight = cardWidth / layout.posterAspectRatio;
  const emptyCopy = resolveLibraryEmptyCopy('watchlist', 'all');

  const handleOpenItem = useCallback(
    (id: string, type: 'movie' | 'tv') => {
      openCatalogDetailFromTab(router, id, type, 'home');
    },
    [router],
  );

  const title = watchlist?.name ?? '';
  const subtitle = watchlist
    ? t('library.watchlistsOverview.titleCount', { count: watchlist.itemCount })
    : undefined;

  const header = (
    <LibraryWatchlistDetailHeader
      title={title}
      subtitle={subtitle}
      description={watchlist?.description}
    />
  );

  if (itemsQuery.isLoading && gridItems.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right']}>
        {header}
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (itemsQuery.isError) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right']}>
        {header}
        <View style={styles.center}>
          <AppText variant="bodySmall" muted>
            {t('social.profileLoadError')}
          </AppText>
          <Pressable onPress={() => void itemsQuery.refetch()}>
            <AppText variant="caption" style={styles.retry}>
              {t('common.retry')}
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      <FlatList
        data={gridItems}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <LibraryEmptyState
            icon={emptyCopy.icon}
            title={emptyCopy.title}
            message={emptyCopy.message}
          />
        }
        renderItem={({ item }) => (
          <LibraryGridCard
            item={item}
            category="watchlist"
            width={cardWidth}
            height={cardHeight}
            quickActionsEnabled
            showStatusBadge={false}
            onPress={() => handleOpenItem(item.id, item.type)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
  },
  loader: {
    paddingVertical: spacing.lg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  retry: {
    color: colors.accent,
  },
});
