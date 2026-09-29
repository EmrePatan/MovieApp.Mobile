export const MAX_RECENT_SEARCHES = 20;

export const RECENT_SEARCH_STORAGE_VERSION = 'v1';

export type RecentSearchEntityType = 'movie' | 'tv' | 'person';

export interface RecentSearchQueryItem {
  kind: 'query';
  query: string;
  accessedAt: number;
}

export interface RecentSearchEntityPayload {
  entityType: RecentSearchEntityType;
  /** Catalog/content id from the API (movie, TV, or person row). */
  catalogId?: string;
  tmdbId?: number;
  title: string;
  posterUrl?: string | null;
}

export interface RecentSearchEntityItem extends RecentSearchEntityPayload {
  kind: 'entity';
  accessedAt: number;
}

export type RecentSearchPayload = RecentSearchQueryItem | RecentSearchEntityItem;

/** `id` is the recent-entry row id (delete/key); entity catalog id lives in `catalogId`. */
export type RecentSearchStoredItem =
  | {
      id: string;
      kind: 'query';
      query: string;
      accessedAt: number;
    }
  | {
      id: string;
      kind: 'entity';
      entityType: RecentSearchEntityType;
      catalogId?: string;
      tmdbId?: number;
      title: string;
      posterUrl?: string | null;
      accessedAt: number;
    };
