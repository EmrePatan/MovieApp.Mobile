import { mapUpcomingCatalogItemToHomeItem } from '@/features/home/utils/map-upcoming-catalog-to-home-item';

describe('mapUpcomingCatalogItemToHomeItem', () => {
  it('maps catalog upcoming items into home rail items without duplication fields', () => {
    const mapped = mapUpcomingCatalogItemToHomeItem({
      id: 'movie-1',
      type: 'movie',
      upcomingKind: 'MovieRelease',
      title: 'Avatar 4',
      originalTitle: 'Avatar 4',
      overview: '',
      posterUrl: '/poster.jpg',
      backdropUrl: null,
      releaseDate: '2026-12-19',
      voteAverage: 8,
      voteCount: 10,
      year: 2026,
      isFollowed: false,
    });

    expect(mapped).toMatchObject({
      id: 'movie-1',
      contentType: 'movie',
      title: 'Avatar 4',
      upcomingKind: 'MovieRelease',
    });
  });
});
