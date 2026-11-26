import { useQuery } from '@tanstack/react-query';
import { updateWatchDates } from '../api/watch-dates-api';

/** How many watched episodes a whole-show date change would touch in the given tab. */
export function useShowEpisodeCount(tvShowId: string | null, undated: boolean) {
  return useQuery({
    queryKey: ['watch-history', 'show-episode-count', tvShowId, { undated }],
    // A dry run: nothing is saved. Mode `unknown` applies to every row, so it counts them all.
    queryFn: () =>
      updateWatchDates({
        movieIds: [],
        episodeIds: [],
        mode: 'unknown',
        tvShowId: tvShowId!,
        undated,
        dryRun: true,
      }),
    select: (result) => result.updatedCount,
    enabled: tvShowId !== null,
    // The count backs a bulk, irreversible change: never show a stale one.
    gcTime: 0,
  });
}
