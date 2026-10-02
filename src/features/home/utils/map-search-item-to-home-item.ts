import type { SearchResultItem } from '@/features/search/types';
import type { HomeItem } from '../types';

export function mapTitleSearchItemToHomeItem(item: SearchResultItem): HomeItem | null {
  if (item.type !== 'movie' && item.type !== 'tv') {
    return null;
  }

  return {
    id: item.id,
    contentType: item.type,
    title: item.title,
    originalTitle: item.originalTitle ?? null,
    posterUrl: item.posterUrl,
    backdropUrl: item.backdropUrl,
    releaseDate: item.releaseDate,
    voteAverage: item.voteAverage,
    voteCount: item.voteCount,
  };
}

export function mapTitleSearchItemsToHomeItems(items: readonly SearchResultItem[]): HomeItem[] {
  const mapped: HomeItem[] = [];

  for (const item of items) {
    const homeItem = mapTitleSearchItemToHomeItem(item);
    if (homeItem) {
      mapped.push(homeItem);
    }
  }

  return mapped;
}
