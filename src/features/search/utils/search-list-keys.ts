import type { SearchResultItem } from '../types';

export function searchResultKeyExtractor(item: SearchResultItem): string {
  return `${item.type}-${item.id}`;
}
