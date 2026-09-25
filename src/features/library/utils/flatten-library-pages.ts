import type { LibraryItem, LibraryListResponse } from '../types/library';
import { getLibraryGridItemKey } from './library-item-key';

export function flattenLibraryPages(pages: LibraryListResponse[]): LibraryItem[] {
  const seen = new Set<string>();
  const items: LibraryItem[] = [];

  for (const page of pages) {
    for (const item of page.items) {
      const key = getLibraryGridItemKey(item);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push(item);
    }
  }

  return items;
}
