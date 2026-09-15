export interface CollectionSummary {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  backdropPath: string | null;
}

export interface CollectionPart {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
}

export interface CollectionDetailResponse {
  tmdbId: number;
  name: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  parts: CollectionPart[];
}
