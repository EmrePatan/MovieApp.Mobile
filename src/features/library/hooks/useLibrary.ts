import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getLibrary } from '../api/library-api';
import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory } from '../types/library';
import { DEFAULT_LIBRARY_PAGE_SIZE } from '../types/library';
import { libraryInfiniteQueryKey } from './library-query-keys';

interface UseLibraryOptions {
  enabled?: boolean;
}

export function useLibrary(
  category: LibraryCategory,
  mediaType: CatalogMediaFilter,
  options: UseLibraryOptions = {},
) {
  const { isAuthenticated } = useAuth();
  const enabled = options.enabled ?? true;

  return useInfiniteQuery({
    queryKey: libraryInfiniteQueryKey(category, mediaType),
    queryFn: ({ pageParam, signal }) =>
      getLibrary(category, mediaType, pageParam, DEFAULT_LIBRARY_PAGE_SIZE, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    enabled: isAuthenticated && enabled,
    staleTime: 30_000,
  });
}
