import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/useAuth';
import { AppText } from '@/components/common/AppText';
import { WatchlistShareButton } from '@/features/watchlist-share/components/WatchlistShareButton';
import type { WatchlistSummaryResponse } from '@/features/watchlists/types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryWatchlistCardProps {
  watchlist: WatchlistSummaryResponse;
  onPress: (watchlistId: string) => void;
}

export const LibraryWatchlistCard = memo(function LibraryWatchlistCard({
  watchlist,
  onPress,
}: LibraryWatchlistCardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const itemCountLabel = t('library.watchlistsOverview.titleCount', {
    count: watchlist.itemCount,
  });

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${watchlist.name}, ${itemCountLabel}`}
        onPress={() => onPress(watchlist.id)}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="bookmark" size={20} color={colors.libraryWatchlist} />
        </View>
        <View style={styles.meta}>
          <AppText variant="body" numberOfLines={1} style={styles.title}>
            {watchlist.name}
          </AppText>
          <AppText variant="caption" muted>
            {itemCountLabel}
          </AppText>
        </View>
      </Pressable>
      {isAuthenticated ? (
        <WatchlistShareButton
          appearance="row"
          isAuthenticated={isAuthenticated}
          watchlistId={watchlist.id}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${watchlist.name}, ${itemCountLabel}`}
        onPress={() => onPress(watchlist.id)}
        hitSlop={8}
        style={({ pressed }) => [styles.chevronHit, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
    minHeight: layout.touchTarget,
  },
  chevronHit: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  title: {
    fontWeight: '600',
  },
});
