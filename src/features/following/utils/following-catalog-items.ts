import type { LibraryTypeFilter } from '@/features/library/types';
import type { FollowingCatalogItem, FollowingCatalogResponse } from '../types';

export function flattenFollowingPages(pages: FollowingCatalogResponse[]): FollowingCatalogItem[] {
  const seen = new Set<string>();
  const items: FollowingCatalogItem[] = [];

  for (const page of pages) {
    for (const item of page.items) {
      const key = `${item.type}-${item.id}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push(item);
    }
  }

  return items;
}

export function filterFollowingItems(
  items: FollowingCatalogItem[],
  filter: LibraryTypeFilter,
): FollowingCatalogItem[] {
  if (filter === 'all') {
    return items;
  }

  return items.filter((item) => item.type === filter);
}
