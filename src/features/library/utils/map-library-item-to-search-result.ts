import type { CatalogSearchResultItem } from '@/features/search/types';
import type { LibraryItem } from '../types/library';

export function mapLibraryItemToSearchResult(item: LibraryItem): CatalogSearchResultItem {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    originalTitle: item.originalTitle ?? '',
    overview: '',
    posterUrl: item.posterUrl,
    backdropUrl: item.backdropUrl,
    releaseDate: null,
    voteAverage: item.voteAverage ?? 0,
    voteCount: 0,
    year: item.year,
  };
}
