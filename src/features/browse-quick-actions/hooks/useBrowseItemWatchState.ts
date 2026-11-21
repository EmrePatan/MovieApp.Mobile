import { useAuth } from '@/auth/useAuth';
import { useMovieWatchStatus } from '@/features/watch-history/hooks/useMovieWatchStatus';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import { isTvShowFullyWatched } from '@/features/watch-history/utils/tv-show-watch-status';
import type { BrowseQuickActionsMediaType } from '../types';

export function useBrowseItemWatchState(
  contentType: BrowseQuickActionsMediaType,
  contentId: string,
) {
  const { isAuthenticated } = useAuth();
  const enabled = isAuthenticated && contentId.length > 0;

  const movieStatus = useMovieWatchStatus(contentId, {
    enabled: enabled && contentType === 'movie',
  });
  const tvProgress = useTvShowProgress(contentType === 'tv' && enabled ? contentId : '');

  if (!enabled) {
    return { isWatched: false, isLoading: false };
  }

  if (contentType === 'movie') {
    return {
      isWatched: movieStatus.data?.isWatched === true,
      isLoading: movieStatus.isLoading,
    };
  }

  return {
    isWatched: isTvShowFullyWatched(tvProgress.data),
    isLoading: tvProgress.isLoading,
  };
}
