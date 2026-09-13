import {
  episodeWatchStatusQueryKey,
  movieWatchStatusQueryKey,
  recentWatchHistoryInfiniteQueryKey,
  seasonProgressQueryKey,
  seasonWatchedEpisodesQueryKey,
  tvShowProgressQueryKey,
} from '@/features/watch-history/hooks/watch-history-query-keys';

describe('watch history query keys', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const episodeId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('uses watch status query keys', () => {
    expect(movieWatchStatusQueryKey(movieId)).toEqual(['watch-history', 'movie', movieId, 'me']);
    expect(episodeWatchStatusQueryKey(episodeId)).toEqual([
      'watch-history',
      'episode',
      episodeId,
      'me',
    ]);
  });

  it('uses progress and recent history query keys', () => {
    expect(recentWatchHistoryInfiniteQueryKey(20)).toEqual(['watch-history', 'recent', 20]);
    expect(tvShowProgressQueryKey(tvShowId)).toEqual([
      'watch-history',
      'tv',
      tvShowId,
      'progress',
    ]);
    expect(seasonProgressQueryKey(tvShowId, 1)).toEqual([
      'watch-history',
      'tv',
      tvShowId,
      'season',
      1,
      'progress',
    ]);
    expect(seasonWatchedEpisodesQueryKey(tvShowId, 1)).toEqual([
      'watch-history',
      'tv',
      tvShowId,
      'season',
      1,
      'watched-episodes',
    ]);
  });
});
