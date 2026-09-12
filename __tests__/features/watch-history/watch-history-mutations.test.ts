import {
  invalidateEpisodeWatchHistoryQueries,
  invalidateMovieWatchHistoryQueries,
} from '@/features/watch-history/hooks/useWatchHistoryMutations';
import {
  episodeWatchStatusQueryKey,
  movieWatchStatusQueryKey,
  seasonProgressQueryKey,
  tvShowProgressQueryKey,
} from '@/features/watch-history/hooks/watch-history-query-keys';

describe('watch history cache invalidation', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const episodeId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('invalidates movie watch history queries', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateMovieWatchHistoryQueries(queryClient, movieId);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: movieWatchStatusQueryKey(movieId),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['watch-history', 'movies'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['watch-history', 'recent'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['home'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['recommendations'] });
  });

  it('invalidates episode progress and history queries', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateEpisodeWatchHistoryQueries(queryClient, episodeId, tvShowId, 1);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: episodeWatchStatusQueryKey(episodeId),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['watch-history', 'episodes'] });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: tvShowProgressQueryKey(tvShowId),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: seasonProgressQueryKey(tvShowId, 1),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['watch-history', 'recent'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['home'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['recommendations'] });
  });
});
