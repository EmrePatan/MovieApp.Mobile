import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory } from '../types/library';
import { DEFAULT_LIBRARY_PAGE_SIZE } from '../types/library';

export function libraryInfiniteQueryKey(
  category: LibraryCategory,
  mediaType: CatalogMediaFilter,
  pageSize = DEFAULT_LIBRARY_PAGE_SIZE,
) {
  return ['library', category, mediaType, pageSize] as const;
}
