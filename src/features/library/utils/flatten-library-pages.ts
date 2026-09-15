import type { LibraryItem, LibraryListResponse } from '../types/library';

export function flattenLibraryPages(pages: LibraryListResponse[]): LibraryItem[] {
  return pages.flatMap((page) => page.items);
}
