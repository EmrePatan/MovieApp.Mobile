export interface EpisodeSummaryResponse {
  id: string;
  episodeNumber: number;
  name: string | null;
  airDate: string | null;
  runtimeMinutes: number | null;
  stillPath: string | null;
  voteAverage: number;
  voteCount: number;
}

export interface EpisodeResponse {
  id: string;
  tvShowId: string;
  seasonId: string;
  seasonNumber: number;
  episodeNumber: number;
  name: string | null;
  overview: string | null;
  airDate: string | null;
  runtimeMinutes: number | null;
  stillPath: string | null;
  voteAverage: number;
  voteCount: number;
}
