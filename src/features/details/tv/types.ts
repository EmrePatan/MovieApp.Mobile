import type { ExternalIdsResponse } from '../shared/types';

export interface SeasonSummaryResponse {
  id: string;
  seasonNumber: number;
  name: string | null;
  airDate: string | null;
  episodeCount: number | null;
  posterPath: string | null;
}

export interface TvShowDetailsResponse {
  id: string;
  externalIds: ExternalIdsResponse;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  firstAirDate: string | null;
  lastAirDate: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  originalLanguage: string | null;
  voteAverage: number;
  voteCount: number;
  status: string;
  genres: string[];
  seasons: SeasonSummaryResponse[];
  canFollow: boolean;
}
