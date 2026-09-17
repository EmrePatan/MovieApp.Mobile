import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { WatchlistSummaryResponse } from '@/features/watchlists/types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryWatchlistCardProps {
  watchlist: WatchlistSummaryResponse;
  onPress: (watchlistId: string) => void;
}

function formatItemCount(count: number): string {
  return count === 1 ? '1 title' : `${count} titles`;
}

export const LibraryWatchlistCard = memo(function LibraryWatchlistCard({
  watchlist,
  onPress,
}: LibraryWatchlistCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${watchlist.name}, ${formatItemCount(watchlist.itemCount)}`}
      onPress={() => onPress(watchlist.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="bookmark" size={20} color={colors.libraryWatchlist} />
      </View>
      <View style={styles.meta}>
        <AppText variant="body" numberOfLines={2} style={styles.title}>
          {watchlist.name}
        </AppText>
        <AppText variant="caption" muted>
          {formatItemCount(watchlist.itemCount)}
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
    gap: spacing.sm,
    minHeight: layout.touchTarget,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
