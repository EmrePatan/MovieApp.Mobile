import type { SearchResultItem } from '@/features/search/types';

/** Title lists are movie and TV only. People never appear on these rails. */
export function selectTitleListItems(items: readonly SearchResultItem[]): SearchResultItem[] {
  return items.filter((item) => item.type === 'movie' || item.type === 'tv');
}
