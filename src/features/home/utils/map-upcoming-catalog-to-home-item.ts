import type { UpcomingCatalogItem } from '@/features/upcoming/types';
import type { HomeItem } from '../types';

export function mapUpcomingCatalogItemToHomeItem(item: UpcomingCatalogItem): HomeItem {
  return {
    id: item.id,
    contentType: item.type,
    title: item.title,
    originalTitle: item.originalTitle,
    posterUrl: item.posterUrl,
    backdropUrl: item.backdropUrl,
    releaseDate: item.releaseDate,
    voteAverage: item.voteAverage,
    voteCount: item.voteCount,
    upcomingKind: item.upcomingKind,
    episodeId: item.episodeId ?? null,
    seasonNumber: item.seasonNumber ?? null,
    episodeNumber: item.episodeNumber ?? null,
    episodeName: item.episodeName ?? null,
  };
}

export function mapUpcomingCatalogItemsToHomeItems(items: UpcomingCatalogItem[]): HomeItem[] {
  return items.map(mapUpcomingCatalogItemToHomeItem);
}
