import { useAuth } from '@/auth/useAuth';
import { useMovieWatchStatus } from '@/features/watch-history/hooks/useMovieWatchStatus';
import { useTvShowCardWatchStatus } from '@/features/watch-history/hooks/useTvShowCardWatchStatus';
import type { BrowseQuickActionsMediaType } from '../types';

export function useBrowseItemWatchState(
  contentType: BrowseQuickActionsMediaType,
  contentId: string,
) {
  const { isAuthenticated } = useAuth();
  const enabled = isAuthenticated && contentId.length > 0;

  // Both lookups are batched with the other posters on screen (one request per screen,
  // not one per card).
  const movieStatus = useMovieWatchStatus(contentId, {
    enabled: enabled && contentType === 'movie',
    batched: true,
  });
  const tvStatus = useTvShowCardWatchStatus(contentType === 'tv' && enabled ? contentId : '');

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
    isWatched: tvStatus.data?.isFullyWatched === true,
    isLoading: tvStatus.isLoading,
  };
}
