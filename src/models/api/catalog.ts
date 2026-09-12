import type { ContentType } from './pagination';

export interface CatalogItem {
  id: string;
  type: ContentType;
  title: string;
  originalTitle: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
  year: number | null;
}

export interface HomeCatalogItem {
  id: string;
  contentType: ContentType;
  title: string;
  originalTitle: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
}
