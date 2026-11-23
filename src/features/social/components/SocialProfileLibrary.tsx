import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { LibraryCategoryControl } from '@/features/library/components/LibraryCategoryControl';
import { LibraryEmptyState } from '@/features/library/components/LibraryEmptyState';
import { LibraryGridCard } from '@/features/library/components/LibraryGridCard';
import { LibraryInlineSearchInput } from '@/features/library/components/LibraryInlineSearchInput';
import { LibraryMediaFilterControl } from '@/features/library/components/LibraryMediaFilterControl';
import { LibraryWatchlistCard } from '@/features/library/components/LibraryWatchlistCard';
import type { CatalogMediaFilter } from '@/features/library/types';
import type { LibraryCategory } from '@/features/library/types/library';
import { resolveLibraryEmptyCopy } from '@/features/library/utils/library-empty-copy';
import type { SocialProfileShelfItem, SocialProfileStatistics } from '../types';
import { useSocialProfileWatchlists } from '../hooks/useSocialQueries';
import { mapSocialShelfToLibraryItem } from '../utils/map-social-shelf-to-library-item';
import { resolveProfileLibraryCategoryTitles } from '../utils/resolve-profile-library-category-titles';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const COLUMNS = 3;
const GAP = spacing.sm;
const DEFAULT_CATEGORY: LibraryCategory = 'watching';
const DEFAULT_MEDIA: CatalogMediaFilter = 'all';

interface SocialProfileLibraryProps {
  userId: string;
  statistics: SocialProfileStatistics;
  onOpenTitle: (item: SocialProfileShelfItem) => void;
  /** Opens a read-only view of one of the profile owner's watchlists. */
  onOpenWatchlist: (watchlistId: string) => void;
  /** False on the signed-in user's own profile: no long-press actions or watched badge. */
  quickActionsEnabled?: boolean;
}

function matchesMedia(item: SocialProfileShelfItem, mediaType: CatalogMediaFilter): boolean {
  if (mediaType === 'all') return true;
  if (mediaType === 'movie') return item.contentType === 'Movie';
  return item.contentType === 'TvShow';
}

function matchesQuery(item: SocialProfileShelfItem, query: string): boolean {
  if (!query) return true;
  return item.title.toLocaleLowerCase().includes(query);
}

export function SocialProfileLibrary({
  userId,
  statistics,
  onOpenTitle,
  onOpenWatchlist,
  quickActionsEnabled = true,
}: SocialProfileLibraryProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<LibraryCategory>(DEFAULT_CATEGORY);
  const [mediaType, setMediaType] = useState<CatalogMediaFilter>(DEFAULT_MEDIA);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  // Switching to a shorter tab would shrink the page and yank the scroll position to the top.
  const [bodyMinHeight, setBodyMinHeight] = useState(0);

  const isWatchlistCategory = category === 'watchlist';
  const watchlistsQuery = useSocialProfileWatchlists(userId, isWatchlistCategory);
  const watchlists = watchlistsQuery.data ?? [];

  const posterWidth = useMemo(
    () => (width - spacing.lg * 2 - GAP * (COLUMNS - 1)) / COLUMNS,
    [width],
  );
  const posterHeight = posterWidth / layout.posterAspectRatio;

  const categoryTitles = useMemo(
    () => resolveProfileLibraryCategoryTitles(statistics, category),
    [category, statistics],
  );

  const effectiveMediaType = category === 'watching' ? 'all' : mediaType;
  const normalizedQuery = searchInput.trim().toLocaleLowerCase();

  const visibleTitles = useMemo(
    () =>
      categoryTitles.filter(
        (item) => matchesMedia(item, effectiveMediaType) && matchesQuery(item, normalizedQuery),
      ),
    [categoryTitles, effectiveMediaType, normalizedQuery],
  );

  const emptyCopy = resolveLibraryEmptyCopy(category, effectiveMediaType);

  const handleClearSearch = useCallback(() => setSearchInput(''), []);
  const handleCloseSearch = useCallback(() => {
    setSearchInput('');
    setSearchOpen(false);
  }, []);

  const renderWatchlists = () => {
    if (watchlistsQuery.isLoading) {
      return <ActivityIndicator color={colors.accent} style={styles.loader} />;
    }

    if (watchlistsQuery.isError) {
      return (
        <View style={styles.inlineError}>
          <AppText variant="caption" muted>
            {t('social.statsLoadError')}
          </AppText>
          <Pressable onPress={() => void watchlistsQuery.refetch()}>
            <AppText variant="caption" style={styles.retry}>
              {t('common.retry')}
            </AppText>
          </Pressable>
        </View>
      );
    }

    if (watchlists.length === 0) {
      return (
        <LibraryEmptyState
          icon={emptyCopy.icon}
          title={emptyCopy.title}
          message={emptyCopy.message}
        />
      );
    }

    return (
      <View style={styles.watchlistList}>
        {watchlists.map((watchlist) => (
          <LibraryWatchlistCard
            key={watchlist.id}
            watchlist={watchlist}
            onPress={onOpenWatchlist}
          />
        ))}
      </View>
    );
  };

  const renderTitleGrid = () => {
    if (visibleTitles.length === 0) {
      return (
        <LibraryEmptyState
          icon={emptyCopy.icon}
          title={
            normalizedQuery
              ? t('library.hub.searchEmptyTitle', { query: searchInput.trim() })
              : emptyCopy.title
          }
          message={
            normalizedQuery ? t('library.hub.searchEmptyMessage') : emptyCopy.message
          }
        />
      );
    }

    return (
      <View style={styles.grid}>
        {visibleTitles.map((item) => {
          const libraryItem = mapSocialShelfToLibraryItem(item, category);
          return (
            <LibraryGridCard
              key={`${category}-${item.id}`}
              item={libraryItem}
              category={category}
              width={posterWidth}
              height={posterHeight}
              quickActionsEnabled={quickActionsEnabled}
              onPress={() => onOpenTitle(item)}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.chrome}>
        {searchOpen ? (
          <LibraryInlineSearchInput
            value={searchInput}
            onChangeText={setSearchInput}
            onClear={handleClearSearch}
            onCancel={handleCloseSearch}
            autoFocus
          />
        ) : (
          <>
            <View style={styles.categoryRow}>
              <View style={styles.categories}>
                <LibraryCategoryControl value={category} onChange={setCategory} />
              </View>
              {!isWatchlistCategory ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('library.hub.searchPlaceholder')}
                  onPress={() => setSearchOpen(true)}
                  hitSlop={8}
                  style={({ pressed }) => [styles.searchIcon, pressed && styles.pressed]}
                >
                  <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
            {category !== 'watching' && !isWatchlistCategory ? (
              <LibraryMediaFilterControl value={mediaType} onChange={setMediaType} />
            ) : null}
          </>
        )}
      </View>

      <View
        style={{ minHeight: bodyMinHeight }}
        onLayout={(event) => {
          const height = Math.ceil(event.nativeEvent.layout.height);
          setBodyMinHeight((current) => (height > current ? height : current));
        }}
      >
        {isWatchlistCategory ? renderWatchlists() : renderTitleGrid()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.xxl,
  },
  chrome: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  categories: {
    flex: 1,
    minWidth: 0,
  },
  searchIcon: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: StyleSheet.hairlineWidth,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  watchlistList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  loader: {
    paddingVertical: spacing.lg,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retry: {
    color: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
});
