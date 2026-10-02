import {
  resolveHomeHeroBackdropUri,
  resolveHomeHeroNeighborPrefetchUris,
  resolveHomeHeroPosterUri,
  resolveHomeHeroPrefetchUri,
  resolveHomeHeroPrimaryUri,
  resolveHomeRecommendedPrefetchUris,
  resolveHomeSectionPosterSize,
  resolveHomeSectionPosterUri,
  resolveHomeTrendingPosterUri,
} from '@/features/home/utils/home-hero-image';
import { resolveImageUri } from '@/utils/image-url';

describe('home hero image urls', () => {
  const originalEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalEnv;
  });

  it('requests w780 hero posters, w1280 backdrop fallbacks, and w780 trending posters', () => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

    expect(resolveHomeHeroPosterUri('/poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/w780/poster.jpg',
    );
    expect(resolveHomeHeroBackdropUri('/backdrop.jpg')).toBe(
      'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
    );
    expect(resolveHomeTrendingPosterUri('/trending.jpg')).toBe(
      'https://image.tmdb.org/t/p/w780/trending.jpg',
    );
    expect(resolveImageUri('/rail-poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/rail-poster.jpg',
    );
  });

  it('prefers the poster over the backdrop for the hero and prefetch', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    expect(
      resolveHomeHeroPrimaryUri({
        backdropUrl: '/backdrop.jpg',
        posterUrl: '/poster.jpg',
      }),
    ).toBe('https://image.tmdb.org/t/p/w780/poster.jpg');

    expect(
      resolveHomeHeroPrefetchUri({
        backdropUrl: '/backdrop.jpg',
        posterUrl: '/poster.jpg',
      }),
    ).toBe('https://image.tmdb.org/t/p/w780/poster.jpg');
  });

  it('prefetches the centered hero, the previous wrap, the next hero, and one extra forward neighbor at w780', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    const items = [
      { posterUrl: '/a.jpg' },
      { posterUrl: '/b.jpg' },
      { posterUrl: null },
    ];

    expect(resolveHomeHeroNeighborPrefetchUris(items, 0)).toEqual([
      resolveHomeHeroPosterUri('/a.jpg'),
      resolveHomeHeroPosterUri('/b.jpg'),
    ]);
    expect(resolveHomeHeroNeighborPrefetchUris(items, 2)).toEqual([
      resolveHomeHeroPosterUri('/b.jpg'),
      resolveHomeHeroPosterUri('/a.jpg'),
    ]);
    expect(resolveHomeHeroNeighborPrefetchUris([{ posterUrl: '/only.jpg' }], 0)).toEqual([
      resolveHomeHeroPosterUri('/only.jpg'),
    ]);

    const ten = Array.from({ length: 10 }, (_, index) => ({
      posterUrl: `/${index}.jpg`,
    }));
    const firstPaint = resolveHomeHeroNeighborPrefetchUris(ten, 0);
    expect(firstPaint).toEqual([
      resolveHomeHeroPosterUri('/0.jpg'),
      resolveHomeHeroPosterUri('/9.jpg'),
      resolveHomeHeroPosterUri('/1.jpg'),
      resolveHomeHeroPosterUri('/2.jpg'),
    ]);
    expect(firstPaint).toHaveLength(4);
    for (const index of [3, 4, 5, 6, 7, 8]) {
      expect(firstPaint).not.toContain(resolveHomeHeroPosterUri(`/${index}.jpg`));
    }
  });

  it('uses one size builder for the rail that is painted and the rail that is prefetched', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    expect(resolveHomeSectionPosterSize('Trending')).toBe('w780');
    expect(resolveHomeSectionPosterSize('RecommendedForYou')).toBe('w500');
    expect(resolveHomeSectionPosterSize('TopRated')).toBe('w500');
    expect(resolveHomeSectionPosterUri('RecommendedForYou', '/one.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/one.jpg',
    );
    expect(resolveHomeRecommendedPrefetchUris([{ posterUrl: '/one.jpg' }])).toEqual([
      resolveHomeSectionPosterUri('RecommendedForYou', '/one.jpg'),
    ]);
    expect(resolveHomeSectionPosterUri('Trending', '/trend.jpg')).toBe(
      resolveHomeTrendingPosterUri('/trend.jpg'),
    );
  });

  it('prefetches the first four recommended posters at w500', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    const items = [
      { posterUrl: '/one.jpg' },
      { posterUrl: '/two.jpg' },
      { posterUrl: null },
      { posterUrl: '/three.jpg' },
      { posterUrl: '/four.jpg' },
      { posterUrl: '/five.jpg' },
    ];

    expect(resolveHomeRecommendedPrefetchUris(items)).toEqual([
      'https://image.tmdb.org/t/p/w500/one.jpg',
      'https://image.tmdb.org/t/p/w500/two.jpg',
      'https://image.tmdb.org/t/p/w500/three.jpg',
      'https://image.tmdb.org/t/p/w500/four.jpg',
    ]);
  });

  it('returns null when the poster is missing', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    expect(
      resolveHomeHeroPrefetchUri({
        backdropUrl: '/backdrop.jpg',
        posterUrl: null,
      }),
    ).toBeNull();

    expect(
      resolveHomeHeroPrimaryUri({
        backdropUrl: '   ',
        posterUrl: null,
      }),
    ).toBeNull();
  });
});
