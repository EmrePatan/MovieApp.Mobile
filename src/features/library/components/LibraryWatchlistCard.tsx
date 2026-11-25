import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { WatchlistCoverCollage } from '@/features/watchlists/components/WatchlistCoverCollage';
import type { WatchlistSummaryResponse } from '@/features/watchlists/types';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

const EMPTY_COVER_POSTERS: readonly string[] = [];

interface LibraryWatchlistCardProps {
  watchlist: WatchlistSummaryResponse;
  onPress: (watchlistId: string) => void;
}

export const LibraryWatchlistCard = memo(function LibraryWatchlistCard({
  watchlist,
  onPress,
}: LibraryWatchlistCardProps) {
  const { t } = useTranslation();
  const itemCountLabel = t('library.watchlistsOverview.titleCount', {
    count: watchlist.itemCount,
  });
  const coverPosterPaths = watchlist.coverPosterPaths ?? EMPTY_COVER_POSTERS;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        watchlist.description
          ? `${watchlist.name}, ${watchlist.description}, ${itemCountLabel}`
          : `${watchlist.name}, ${itemCountLabel}`
      }
      onPress={() => onPress(watchlist.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {coverPosterPaths.length > 0 ? (
        <WatchlistCoverCollage posterPaths={coverPosterPaths} />
      ) : (
        <View style={styles.iconWrap}>
          <Ionicons name="bookmark" size={20} color={colors.libraryWatchlist} />
        </View>
      )}
      <View style={styles.meta}>
        <AppText variant="body" numberOfLines={2} style={styles.title}>
          {watchlist.name}
        </AppText>
        {watchlist.description ? (
          <AppText variant="caption" muted numberOfLines={2}>
            {watchlist.description}
          </AppText>
        ) : null}
        <AppText variant="caption" muted>
          {itemCountLabel}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.touchTarget,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panel,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.libraryWatchlistTint12,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  title: {
    fontWeight: '600',
  },
});
