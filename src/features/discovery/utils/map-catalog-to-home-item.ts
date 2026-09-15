import type { HomeItem } from '@/features/home/types';
import type { SearchResultItem } from '@/features/search/types';

export function mapCatalogItemToHomeItem(item: SearchResultItem): HomeItem {
  return {
    id: item.id,
    contentType: item.type,
    title: item.title,
    originalTitle: item.originalTitle ?? null,
    posterUrl: item.posterUrl ?? null,
    backdropUrl: item.backdropUrl ?? null,
    releaseDate: item.releaseDate ?? null,
    voteAverage: item.voteAverage,
    voteCount: item.voteCount,
  };
}
