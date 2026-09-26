import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory } from '../types/library';

export function buildLibraryPath(
  category: LibraryCategory,
  mediaType: CatalogMediaFilter,
  page: number,
  pageSize: number,
  cursor?: string | null,
): string {
  const params = new URLSearchParams({
    category,
    mediaType,
    pageSize: String(pageSize),
  });

  if (cursor) {
    params.set('cursor', cursor);
    params.set('page', '1');
  } else {
    params.set('page', String(page));
  }

  return `/api/library?${params.toString()}`;
}
