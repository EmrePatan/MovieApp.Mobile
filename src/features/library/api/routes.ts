import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory } from '../types/library';

export function buildLibraryPath(
  category: LibraryCategory,
  mediaType: CatalogMediaFilter,
  page: number,
  pageSize: number,
): string {
  const params = new URLSearchParams({
    category,
    mediaType,
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/library?${params.toString()}`;
}
