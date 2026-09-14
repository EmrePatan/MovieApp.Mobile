import { QueryClient } from '@tanstack/react-query';
import {
  buildSeasonProgressMap,
  updateTvShowAggregateSeasonProgress,
} from '@/features/watch-history/utils/tv-show-progress-cache';
import { tvShowProgressQueryKey } from '@/features/watch-history/hooks/watch-history-query-keys';

describe('tv show progress cache helpers', () => {
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('builds O(1) season lookup map', () => {
    const map = buildSeasonProgressMap([
      { seasonNumber: 1, totalEpisodes: 10, watchedEpisodes: 4, progressPercentage: 40 },
      { seasonNumber: 2, totalEpisodes: 8, watchedEpisodes: 8, progressPercentage: 100 },
    ]);

    expect(map.get(1)?.watchedEpisodes).toBe(4);
    expect(map.get(2)?.watchedEpisodes).toBe(8);
    expect(map.get(3)).toBeUndefined();
  });

  it('updates aggregate season progress and overall totals', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(tvShowProgressQueryKey(tvShowId), {
      tvShowId,
      totalEpisodes: 18,
      watchedEpisodes: 4,
      progressPercentage: 22.22,
      regularTotalEpisodes: 18,
      regularWatchedEpisodes: 4,
      isFullyWatched: false,
      nextEpisode: null,
      seasons: [
        { seasonNumber: 1, totalEpisodes: 10, watchedEpisodes: 4, progressPercentage: 40 },
        { seasonNumber: 2, totalEpisodes: 8, watchedEpisodes: 0, progressPercentage: 0 },
      ],
    });

    updateTvShowAggregateSeasonProgress(queryClient, tvShowId, 2, 3, 8);

    const updated = queryClient.getQueryData(tvShowProgressQueryKey(tvShowId));
    expect(updated).toMatchObject({
      watchedEpisodes: 7,
      totalEpisodes: 18,
      seasons: [
        { seasonNumber: 1, watchedEpisodes: 4 },
        { seasonNumber: 2, watchedEpisodes: 3 },
      ],
    });
  });
});
