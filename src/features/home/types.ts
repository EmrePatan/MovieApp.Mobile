import type { ContentType } from '@/models/api/pagination';

export type HomeTypeFilter = 'all' | ContentType;

export interface HomeRequest {
  type?: HomeTypeFilter;
  sectionSize?: number;
}

export type HomeSectionType =
  | 'HotThisWeek'
  | 'RecommendedForYou'
  | 'ComingUp'
  | 'BecauseYouWatched'
  | 'BasedOnFavorites'
  | 'ContinueWatching'
  | 'Trending'
  | 'Popular'
  | 'NewReleases'
  | 'TopRated'
  | 'Genre'
  | (string & {});

export type HomeUpcomingKind = 'MovieRelease' | 'TvShowPremiere' | 'TvEpisode';

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
  upcomingKind?: HomeUpcomingKind | null;
  episodeId?: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeName?: string | null;
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

export interface HomeBrowseResponse {
  sections: HomeSection[];
  generatedAtUtc: string;
}

export interface HomePersonalizedResponse {
  sections: HomeSection[];
  isPersonalized: boolean;
  generatedAtUtc: string;
}

export const DEFAULT_HOME_SECTION_SIZE = 10;
