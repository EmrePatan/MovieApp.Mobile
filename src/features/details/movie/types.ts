import type { CollectionSummary } from '../collection/types';
import type { ExternalIdsResponse } from '../shared/types';

export interface MovieDetailsResponse {
  id: string;
  externalIds: ExternalIdsResponse;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  posterPath: string | null;
  backdropPath: string | null;
  originalLanguage: string | null;
  voteAverage: number;
  voteCount: number;
  genres: string[];
  collection: CollectionSummary | null;
}
