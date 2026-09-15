import { api } from '@/api/client';
import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory, LibraryListResponse } from '../types/library';
import { DEFAULT_LIBRARY_PAGE_SIZE } from '../types/library';
import { buildLibraryPath } from './routes';

export async function getLibrary(
  category: LibraryCategory,
  mediaType: CatalogMediaFilter,
  page = 1,
  pageSize = DEFAULT_LIBRARY_PAGE_SIZE,
  signal?: AbortSignal,
): Promise<LibraryListResponse> {
  return api.get<LibraryListResponse>(
    buildLibraryPath(category, mediaType, page, pageSize),
    { signal },
  );
}
