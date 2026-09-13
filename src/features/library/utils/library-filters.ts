import type { LibraryItem } from '@/features/watchlists/utils/library-items';
import type { LibraryTypeFilter } from '../types';

export function filterLibraryItems(
  items: LibraryItem[],
  filter: LibraryTypeFilter,
): LibraryItem[] {
  if (filter === 'all') {
    return items;
  }

  return items.filter((item) => item.type === filter);
}
