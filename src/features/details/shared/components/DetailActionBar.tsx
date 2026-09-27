import { StyleSheet, View } from 'react-native';
import { DetailActionStatusProvider } from '@/features/library-actions/context/DetailActionStatusContext';
import { useCatalogDetailLibraryActions } from '@/features/library-actions/hooks/useCatalogDetailLibraryActions';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { FollowButton } from '@/features/follows/components/FollowButton';
import { MovieFollowButton } from '@/features/follows/components/MovieFollowButton';
import { AddToWatchlistButton } from '@/features/watchlists/components/AddToWatchlistButton';
import { WatchedButton } from '@/features/watch-history/components/WatchedButton';
import {
  DetailPersonalRatingRow,
  useOptionalDetailPersonalRating,
} from './DetailPersonalRatingExperience';
import type { FavoriteContentType } from '@/features/favorites/types';
import { spacing } from '@/theme/spacing';

interface DetailActionBarProps {
  contentType: FavoriteContentType;
  contentId: string;
  showWatched?: boolean;
  showReleaseAlert?: boolean;
  showFollow?: boolean;
  watchEligible?: boolean;
  showPersonalRatingRow?: boolean;
}

export function DetailActionBar({
  contentType,
  contentId,
  showWatched = false,
  showReleaseAlert = false,
  showFollow = false,
  watchEligible = showWatched,
  showPersonalRatingRow = false,
}: DetailActionBarProps) {
  const batchState = useCatalogDetailLibraryActions(contentType, contentId);
  const personalRating = useOptionalDetailPersonalRating();
  const watchedTarget =
    contentType === 'movie'
      ? { type: 'movie' as const, contentId }
      : { type: 'tvshow' as const, contentId };

  return (
    <DetailActionStatusProvider value={batchState}>
      <View style={styles.container} testID="detail-action-bar">
        <FavoriteButton contentType={contentType} contentId={contentId} variant="detail" />
        <AddToWatchlistButton contentType={contentType} contentId={contentId} variant="detail" />
        {showWatched ? (
          <WatchedButton
            target={watchedTarget}
            variant="detail"
            onMarkedWatched={personalRating?.handleMarkedWatched}
            onBeforeUnwatch={personalRating?.confirmUnwatchIfNeeded}
          />
        ) : null}
        {contentType === 'tv' && showFollow ? <FollowButton tvShowId={contentId} /> : null}
        {contentType === 'movie' && showReleaseAlert ? (
          <MovieFollowButton movieId={contentId} />
        ) : null}
      </View>
      {showPersonalRatingRow ? (
        <DetailPersonalRatingRow
          contentType={contentType === 'movie' ? 'movie' : 'tv'}
          contentId={contentId}
          watchEligible={watchEligible}
        />
      ) : null}
    </DetailActionStatusProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
});

