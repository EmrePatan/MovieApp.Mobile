import type { LibraryItem as LibraryGridItem } from '../types/library';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';

export function getLibraryItemKey(item: LibraryItem): string {
  return `${item.type}-${item.id}`;
}

export function getLibraryGridItemKey(item: LibraryGridItem): string {
  return `${item.type}:${item.id}`;
}
