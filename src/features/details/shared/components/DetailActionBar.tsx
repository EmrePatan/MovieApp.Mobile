import { StyleSheet, View } from 'react-native';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton';
import { WatchedButton } from '@/features/watch-history/components/WatchedButton';
import type { FavoriteContentType } from '@/features/favorites/types';
import { spacing } from '@/theme/spacing';

const ACTION_SIZE = 44;

interface DetailActionBarProps {
  contentType: FavoriteContentType;
  contentId: string;
  showWatched?: boolean;
}

export function DetailActionBar({
  contentType,
  contentId,
  showWatched = false,
}: DetailActionBarProps) {
  return (
    <View style={styles.container}>
      <FavoriteButton contentType={contentType} contentId={contentId} size={ACTION_SIZE} />
      <AddToWatchlistButton contentType={contentType} contentId={contentId} variant="icon" />
      {showWatched ? (
        <WatchedButton target={{ type: 'movie', contentId }} size={ACTION_SIZE} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
