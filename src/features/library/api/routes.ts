import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory } from '../types/library';

export function buildLibraryPath(
  category: LibraryCategory,
  mediaType: CatalogMediaFilter,
  page: number,
  pageSize: number,
  cursor?: string | null,
  query?: string | null,
): string {
  const params = new URLSearchParams({
    category,
    mediaType,
    pageSize: String(pageSize),
  });

  const normalizedQuery = query?.trim();
  if (normalizedQuery) {
    params.set('q', normalizedQuery);
  }

  if (cursor) {
    params.set('cursor', cursor);
    params.set('page', '1');
  } else {
    params.set('page', String(page));
  }

  return `/api/library?${params.toString()}`;
}

export function buildLibrarySearchPath(
  query: string,
  mediaType: CatalogMediaFilter,
  page: number,
  pageSize: number,
): string {
  const params = new URLSearchParams({
    q: query.trim(),
    mediaType,
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/library/search?${params.toString()}`;
}
