import { mapWatchlistItemToLibraryGridItem } from '@/features/library/utils/map-watchlist-item-to-grid-item';

describe('mapWatchlistItemToLibraryGridItem', () => {
  it('maps watchlist items into the library grid item shape', () => {
    expect(
      mapWatchlistItemToLibraryGridItem({
        id: 'movie-1',
        type: 'movie',
        title: 'Interstellar',
        posterPath: '/poster.jpg',
        airDate: '2014-11-05',
        voteAverage: 8.5,
        createdAt: '2026-01-01T00:00:00Z',
      }),
    ).toEqual({
      id: 'movie-1',
      type: 'movie',
      title: 'Interstellar',
      originalTitle: null,
      posterUrl: '/poster.jpg',
      backdropUrl: null,
      year: 2014,
      voteAverage: 8.5,
      addedAt: '2026-01-01T00:00:00Z',
      watchedAt: null,
      lastActivityAt: null,
      progressPercentage: null,
      nextEpisode: null,
      collectionStatus: 'watchlist',
    });
  });
});
