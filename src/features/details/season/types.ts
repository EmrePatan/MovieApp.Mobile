import type { EpisodeSummaryResponse } from '../episode/types';

export interface SeasonResponse {
  id: string;
  tvShowId: string;
  seasonNumber: number;
  name: string | null;
  overview: string | null;
  airDate: string | null;
  episodeCount: number | null;
  posterPath: string | null;
  episodes: EpisodeSummaryResponse[];
}
