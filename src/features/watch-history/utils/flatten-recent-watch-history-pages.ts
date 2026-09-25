import type { RecentWatchHistoryItemResponse, RecentWatchHistoryResponse } from '../types';

export function recentWatchHistoryItemKey(item: RecentWatchHistoryItemResponse): string {
  return `${item.type}-${item.movieId ?? item.episodeId}-${item.watchedAt}`;
}

export function flattenRecentWatchHistoryPages(
  pages: RecentWatchHistoryResponse[],
): RecentWatchHistoryItemResponse[] {
  const seen = new Set<string>();
  const items: RecentWatchHistoryItemResponse[] = [];

  for (const page of pages) {
    for (const item of page.items) {
      const key = recentWatchHistoryItemKey(item);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push(item);
    }
  }

  return items;
}
