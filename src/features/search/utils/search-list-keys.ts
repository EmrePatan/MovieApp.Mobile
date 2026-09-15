import { isPersonSearchResult, type SearchResultItem } from '../types';

export function searchResultKeyExtractor(item: SearchResultItem): string {
  if (isPersonSearchResult(item)) {
    return `person-${item.tmdbId}`;
  }

  return `${item.type}-${item.id}`;
}
