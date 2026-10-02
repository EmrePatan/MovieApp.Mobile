import {
  resolveHomeHeroBackdropUri,
  resolveHomeHeroNeighborPrefetchUris,
  resolveHomeHeroPosterUri,
  resolveHomeHeroPrefetchUri,
  resolveHomeHeroPrimaryUri,
  resolveHomeRecommendedPrefetchUris,
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

  it('prefetches the visible hero and the next one, wrapping to the first', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    const items = [
      { posterUrl: '/a.jpg' },
      { posterUrl: '/b.jpg' },
      { posterUrl: null },
    ];

    expect(resolveHomeHeroNeighborPrefetchUris(items, 0)).toEqual([
      'https://image.tmdb.org/t/p/w780/a.jpg',
      'https://image.tmdb.org/t/p/w780/b.jpg',
    ]);
    expect(resolveHomeHeroNeighborPrefetchUris(items, 2)).toEqual([
      'https://image.tmdb.org/t/p/w780/a.jpg',
    ]);
    expect(resolveHomeHeroNeighborPrefetchUris([{ posterUrl: '/only.jpg' }], 0)).toEqual([
      'https://image.tmdb.org/t/p/w780/only.jpg',
    ]);
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
