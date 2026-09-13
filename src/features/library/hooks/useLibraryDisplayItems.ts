import { useMemo } from 'react';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';
import { filterLibraryItems } from '../utils/library-filters';
import { sortLibraryItems } from '../utils/library-sort';
import type { LibrarySortOption, LibraryTypeFilter } from '../types';

interface UseLibraryDisplayItemsOptions {
  items: LibraryItem[];
  typeFilter: LibraryTypeFilter;
  sort: LibrarySortOption;
}

export function useLibraryDisplayItems({
  items,
  typeFilter,
  sort,
}: UseLibraryDisplayItemsOptions): LibraryItem[] {
  return useMemo(() => {
    const filtered = filterLibraryItems(items, typeFilter);
    return sortLibraryItems(filtered, sort);
  }, [items, sort, typeFilter]);
}
