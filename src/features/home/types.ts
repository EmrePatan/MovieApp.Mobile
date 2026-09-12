import type { ContentType } from '@/models/api/pagination';

export type HomeTypeFilter = 'all' | ContentType;

export interface HomeRequest {
  type?: HomeTypeFilter;
  sectionSize?: number;
}

export type HomeSectionType =
  | 'RecommendedForYou'
  | 'BecauseYouWatched'
  | 'BasedOnFavorites'
  | 'ContinueWatching'
  | 'Trending'
  | 'Popular'
  | 'NewReleases'
  | 'TopRated'
  | 'Genre'
  | (string & {});

export interface HomeItem {
  id: string;
  contentType: ContentType;
  title: string;
  originalTitle: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
}

export interface HomeSection {
  type: HomeSectionType;
  title: string;
  items: HomeItem[];
  displayOrder: number;
}

export interface HomeResponse {
  sections: HomeSection[];
  isPersonalized: boolean;
}

export const DEFAULT_HOME_SECTION_SIZE = 10;
