import type { LibraryItem } from '@/features/watchlists/utils/library-items';

export function getLibraryItemKey(item: LibraryItem): string {
  return `${item.type}-${item.id}`;
}
