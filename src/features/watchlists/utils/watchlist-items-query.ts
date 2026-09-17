import type { CatalogMediaFilter, LibrarySortOption } from '@/features/library/types';

export interface WatchlistItemsQueryParams {
  mediaType: CatalogMediaFilter;
  sort: LibrarySortOption;
}

export function toWatchlistItemsMediaTypeQuery(mediaType: CatalogMediaFilter): string {
  return mediaType;
}

export function toWatchlistItemsSortQuery(sort: LibrarySortOption): string {
  return sort;
}
