import { api } from '@/api/client';
import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory, LibraryListResponse } from '../types/library';
import { DEFAULT_LIBRARY_PAGE_SIZE } from '../types/library';
import { buildLibraryPath, buildLibrarySearchPath } from './routes';

export async function getLibrary(
  category: LibraryCategory,
  mediaType: CatalogMediaFilter,
  pageOrCursor: number | string = 1,
  pageSize = DEFAULT_LIBRARY_PAGE_SIZE,
  signal?: AbortSignal,
  query?: string | null,
): Promise<LibraryListResponse> {
  const path = typeof pageOrCursor === 'string'
    ? buildLibraryPath(category, mediaType, 1, pageSize, pageOrCursor, query)
    : buildLibraryPath(category, mediaType, pageOrCursor, pageSize, null, query);

  return api.get<LibraryListResponse>(path, { signal });
}

export async function searchLibrary(
  query: string,
  mediaType: CatalogMediaFilter,
  page = 1,
  pageSize = DEFAULT_LIBRARY_PAGE_SIZE,
  signal?: AbortSignal,
): Promise<LibraryListResponse> {
  return api.get<LibraryListResponse>(
    buildLibrarySearchPath(query, mediaType, page, pageSize),
    { signal },
  );
}
