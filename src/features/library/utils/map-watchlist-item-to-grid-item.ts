import type { LibraryItem as GridLibraryItem } from '../types/library';
import type { LibraryItem as WatchlistLibraryItem } from '@/features/watchlists/utils/library-items';

export function mapWatchlistItemToLibraryGridItem(
  item: WatchlistLibraryItem,
): GridLibraryItem {
  const year = item.airDate ? Number.parseInt(item.airDate.slice(0, 4), 10) : null;

  return {
    id: item.id,
    type: item.type,
    title: item.title,
    originalTitle: null,
    posterUrl: item.posterPath,
    backdropUrl: null,
    year: Number.isFinite(year) ? year : null,
    voteAverage: item.voteAverage,
    addedAt: item.createdAt,
    watchedAt: null,
    lastActivityAt: null,
    progressPercentage: null,
    nextEpisode: null,
    collectionStatus: 'watchlist',
  };
}
