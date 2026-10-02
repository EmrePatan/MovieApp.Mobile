import type { LibraryItem } from '../types/library';
import { normalizeSearchQuery } from '@/features/search/utils/search-query';

export function libraryItemMatchesQuery(item: LibraryItem, normalizedQuery: string): boolean {
  const query = normalizeSearchQuery(normalizedQuery).toLocaleLowerCase();
  if (!query) {
    return false;
  }

  const title = item.title.toLocaleLowerCase();
  const originalTitle = item.originalTitle?.toLocaleLowerCase() ?? '';

  return title.includes(query) || (originalTitle.length > 0 && originalTitle.includes(query));
}
