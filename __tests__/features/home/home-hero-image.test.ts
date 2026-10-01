import {
  resolveHomeHeroBackdropUri,
  resolveHomeHeroPosterUri,
  resolveHomeHeroPrefetchUri,
  resolveHomeHeroPrimaryUri,
  resolveHomeTrendingPosterUri,
} from '@/features/home/utils/home-hero-image';
import { resolveImageUri } from '@/utils/image-url';

describe('home hero image urls', () => {
  const originalEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalEnv;
  });

  it('requests original posters, w1280 backdrop fallbacks, and w780 trending posters', () => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

    expect(resolveHomeHeroPosterUri('/poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/original/poster.jpg',
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
    ).toBe('https://image.tmdb.org/t/p/original/poster.jpg');

    expect(
      resolveHomeHeroPrefetchUri({
        backdropUrl: '/backdrop.jpg',
        posterUrl: '/poster.jpg',
      }),
    ).toBe('https://image.tmdb.org/t/p/original/poster.jpg');
  });

  it('uses the backdrop only when the poster is missing', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    expect(
      resolveHomeHeroPrefetchUri({
        backdropUrl: '/backdrop.jpg',
        posterUrl: null,
      }),
    ).toBe('https://image.tmdb.org/t/p/w1280/backdrop.jpg');

    expect(
      resolveHomeHeroPrimaryUri({
        backdropUrl: '   ',
        posterUrl: null,
      }),
    ).toBeNull();
  });
});
