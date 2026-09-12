import {
  mapWatchlistPageToLibraryItems,
  flattenWatchlistPages,
} from '@/features/watchlists/utils/library-items';
import type { WatchlistItemsResponse } from '@/features/watchlists/types';

describe('library items utils', () => {
  const page: WatchlistItemsResponse = {
    movies: [
      {
        id: 'movie-id',
        title: 'Interstellar',
        posterPath: '/poster.jpg',
        releaseDate: '2014-11-07',
        voteAverage: 8.4,
        createdAt: '2026-09-11T14:30:00Z',
      },
    ],
    tvShows: [
      {
        id: 'tv-id',
        title: 'Breaking Bad',
        posterPath: null,
        firstAirDate: '2008-01-20',
        voteAverage: 8.9,
        createdAt: '2026-09-12T14:30:00Z',
      },
    ],
    page: 1,
    pageSize: 20,
    totalCount: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  it('maps watchlist page items into library items', () => {
    const items = mapWatchlistPageToLibraryItems(page);
    expect(items).toHaveLength(2);
    expect(items[0]?.type).toBe('tv');
    expect(items[1]?.type).toBe('movie');
  });

  it('flattens paginated watchlist pages without duplicates', () => {
    const items = flattenWatchlistPages([page, page]);
    expect(items).toHaveLength(2);
  });
});
