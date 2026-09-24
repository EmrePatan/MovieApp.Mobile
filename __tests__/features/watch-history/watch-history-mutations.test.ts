import {
  applyOptimisticSeasonProgressCount,
  invalidateEpisodeWatchHistoryQueries,
  invalidateMovieWatchHistoryQueries,
  toggleSeasonWatchedEpisodeId,
} from '@/features/watch-history/hooks/useWatchHistoryMutations';
import { updateTvShowAggregateSeasonProgress } from '@/features/watch-history/utils/tv-show-progress-cache';
import {
  episodeWatchStatusQueryKey,
  movieWatchStatusQueryKey,
  seasonProgressQueryKey,
  seasonWatchedEpisodesQueryKey,
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
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['library'] });
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
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: seasonWatchedEpisodesQueryKey(tvShowId, 1),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['watch-history', 'recent'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['home'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['recommendations'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['library'] });
  });

  it('toggles season watched episode ids without duplicates', () => {
    expect(toggleSeasonWatchedEpisodeId(['a'], 'b', true)).toEqual(['a', 'b']);
    expect(toggleSeasonWatchedEpisodeId(['a', 'b'], 'b', true)).toEqual(['a', 'b']);
    expect(toggleSeasonWatchedEpisodeId(['a', 'b'], 'b', false)).toEqual(['a']);
  });

  it('updates season and TV progress caches optimistically', () => {
    const setQueryData = jest.fn();
    const queryClient = {
      getQueryData: jest.fn((key) => {
        if (key[5] === 'progress' && key[4] === 1) {
          return {
            tvShowId,
            seasonNumber: 1,
            totalEpisodes: 22,
            watchedEpisodes: 8,
            progressPercentage: 36.36,
            nextEpisode: null,
          };
        }

        return {
          tvShowId,
          totalEpisodes: 35,
          watchedEpisodes: 8,
          progressPercentage: 22.86,
          nextEpisode: null,
          seasons: [
            { seasonNumber: 1, totalEpisodes: 22, watchedEpisodes: 8, progressPercentage: 36.36 },
            { seasonNumber: 2, totalEpisodes: 13, watchedEpisodes: 0, progressPercentage: 0 },
          ],
        };
      }),
      setQueryData,
    } as never;

    applyOptimisticSeasonProgressCount(queryClient, tvShowId, 1, 13);
    updateTvShowAggregateSeasonProgress(queryClient, tvShowId, 1, 13, 22);

    expect(setQueryData).toHaveBeenCalledWith(
      ['watch-history', 'tv', tvShowId, 'season', 1, 'progress'],
      expect.objectContaining({
        watchedEpisodes: 13,
        totalEpisodes: 22,
      }),
    );
    expect(setQueryData).toHaveBeenCalledWith(
      ['watch-history', 'tv', tvShowId, 'progress'],
      expect.objectContaining({
        watchedEpisodes: 13,
      }),
    );
  });
});
