import {
  flattenFavoritesPages,
  mapFavoritesPageToLibraryItems,
} from '@/features/favorites/utils/favorite-library-items';

describe('favorite library items', () => {
  it('maps a favorites page to library items', () => {
    const items = mapFavoritesPageToLibraryItems({
      movies: [
        {
          id: 'movie-id',
          title: 'Inception',
          posterPath: '/poster.jpg',
          releaseDate: '2010-07-16',
          voteAverage: 8.8,
        },
      ],
      tvShows: [
        {
          id: 'tv-id',
          title: 'Breaking Bad',
          posterPath: null,
          firstAirDate: '2008-01-20',
          voteAverage: 8.9,
        },
      ],
      page: 1,
      pageSize: 20,
      totalCount: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    expect(items).toEqual([
      expect.objectContaining({ id: 'movie-id', type: 'movie', title: 'Inception' }),
      expect.objectContaining({ id: 'tv-id', type: 'tv', title: 'Breaking Bad' }),
    ]);
  });

  it('flattens pages without duplicates', () => {
    const page = {
      movies: [
        {
          id: 'movie-id',
          title: 'Inception',
          posterPath: null,
          releaseDate: '2010-07-16',
          voteAverage: 8.8,
        },
      ],
      tvShows: [],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    };

    const items = flattenFavoritesPages([page, page]);
    expect(items).toHaveLength(1);
  });
});
