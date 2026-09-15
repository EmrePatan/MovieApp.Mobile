import { StyleSheet, View } from 'react-native';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { MovieFollowButton } from '@/features/follows/components/MovieFollowButton';
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton';
import { WatchedButton } from '@/features/watch-history/components/WatchedButton';
import type { FavoriteContentType } from '@/features/favorites/types';
import { spacing } from '@/theme/spacing';

interface DetailActionBarProps {
  contentType: FavoriteContentType;
  contentId: string;
  showWatched?: boolean;
  releaseDate?: string | null;
}

export function DetailActionBar({
  contentType,
  contentId,
  showWatched = false,
  releaseDate,
}: DetailActionBarProps) {
  const watchedTarget =
    contentType === 'movie'
      ? { type: 'movie' as const, contentId }
      : { type: 'tvshow' as const, contentId };

  return (
    <View style={styles.container} testID="detail-action-bar">
      <FavoriteButton contentType={contentType} contentId={contentId} variant="detail" />
      <AddToWatchlistButton contentType={contentType} contentId={contentId} variant="detail" />
      {showWatched ? <WatchedButton target={watchedTarget} variant="detail" /> : null}
      {contentType === 'tv' && showWatched ? <FollowButton tvShowId={contentId} /> : null}
      {contentType === 'movie' ? (
        <MovieFollowButton movieId={contentId} releaseDate={releaseDate} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});

