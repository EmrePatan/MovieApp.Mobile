import type { UpcomingCatalogItem } from '../types';
import type { PaginatedResponse } from '@/models/api/pagination';

export function flattenUpcomingPages(
  pages: PaginatedResponse<UpcomingCatalogItem>[],
): UpcomingCatalogItem[] {
  const seen = new Set<string>();
  const items: UpcomingCatalogItem[] = [];

  for (const page of pages) {
    for (const item of page.items) {
      const key = item.upcomingKind === 'TvEpisode' && item.episodeId
        ? `episode-${item.episodeId}`
        : `${item.type}-${item.id}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push(item);
    }
  }

  return items;
}
