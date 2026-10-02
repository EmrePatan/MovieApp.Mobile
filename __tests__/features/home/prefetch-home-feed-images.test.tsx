import { Image } from 'react-native';
import { prefetchHomeFeedImages } from '@/features/home/utils/prefetch-home-feed-images';
import type { HomeItem, HomeSection } from '@/features/home/types';

function createItem(id: string, posterUrl: string | null): HomeItem {
  return {
    id,
    contentType: 'movie',
    title: id,
    originalTitle: null,
    posterUrl,
    backdropUrl: null,
    releaseDate: '2024-01-01',
    voteAverage: 7,
    voteCount: 10,
  };
}

describe('prefetchHomeFeedImages', () => {
  const originalEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalEnv;
    jest.restoreAllMocks();
  });

  it('warms the visible and next hero at w780 and the first four recommended posters at w500', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
    const prefetchSpy = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);
    const heroItems = [
      createItem('hero-1', '/hero-a.jpg'),
      createItem('hero-2', '/hero-b.jpg'),
    ];
    const sections: HomeSection[] = [
      {
        type: 'RecommendedForYou',
        title: 'Recommended',
        displayOrder: 1,
        items: [
          createItem('rec-1', '/one.jpg'),
          createItem('rec-2', '/two.jpg'),
          createItem('rec-3', '/three.jpg'),
          createItem('rec-4', '/four.jpg'),
          createItem('rec-5', '/five.jpg'),
        ],
      },
      {
        type: 'Trending',
        title: 'Trending',
        displayOrder: 2,
        items: [createItem('trend-1', '/trend.jpg')],
      },
    ];

    prefetchHomeFeedImages(heroItems, sections);

    expect(prefetchSpy.mock.calls.map((call) => call[0])).toEqual([
      'https://image.tmdb.org/t/p/w780/hero-a.jpg',
      'https://image.tmdb.org/t/p/w780/hero-b.jpg',
      'https://image.tmdb.org/t/p/w500/one.jpg',
      'https://image.tmdb.org/t/p/w500/two.jpg',
      'https://image.tmdb.org/t/p/w500/three.jpg',
      'https://image.tmdb.org/t/p/w500/four.jpg',
    ]);
  });
});
