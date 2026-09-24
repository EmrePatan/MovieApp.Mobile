export type ExternalRatingSource =
  | 'imdb'
  | 'letterboxd'
  | 'tomatometer'
  | 'popcornmeter'
  | 'metacritic'
  | 'tmdb';

export interface ExternalRatingItem {
  source: ExternalRatingSource | string;
  value: number;
  scale: number;
  votes?: number | null;
}

export interface ExternalRatingsResponse {
  fetchedAtUtc: string | null;
  isStale: boolean;
  ratings: ExternalRatingItem[];
}

export type ExternalRatingsMediaType = 'movie' | 'tv';
