import { isPersonSearchResult, type SearchResultItem } from '../types';

export function searchResultKeyExtractor(item: SearchResultItem): string {
  if (isPersonSearchResult(item)) {
    return `person-${item.tmdbId}`;
  }

  return `${item.type}-${item.id}`;
}

/** Flatten infinite-query pages and drop duplicate catalog rows (API overlap between pages). */
export function flattenDedupedSearchResultPages(
  pages: { items: SearchResultItem[] }[] | undefined,
): SearchResultItem[] {
  if (!pages?.length) {
    return [];
  }

  const seen = new Set<string>();
  const items: SearchResultItem[] = [];

  for (const page of pages) {
    for (const item of page.items) {
      const key = searchResultKeyExtractor(item);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push(item);
    }
  }

  return items;
}
