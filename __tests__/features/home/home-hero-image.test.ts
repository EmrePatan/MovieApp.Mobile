import {
  resolveHomeHeroBackdropUri,
  resolveHomeHeroPosterUri,
  resolveHomeHeroPrefetchUri,
} from '@/features/home/utils/home-hero-image';
import { resolveImageUri } from '@/utils/image-url';

describe('home hero image urls', () => {
  const originalEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalEnv;
  });

  it('requests w1280 backdrops and w780 posters when the shared base is w500', () => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

    expect(resolveHomeHeroBackdropUri('/backdrop.jpg')).toBe(
      'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
    );
    expect(resolveHomeHeroPosterUri('/poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/w780/poster.jpg',
    );
    expect(resolveImageUri('/rail-poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/rail-poster.jpg',
    );
  });

  it('prefetches the backdrop, then the poster', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    expect(
      resolveHomeHeroPrefetchUri({
        backdropUrl: '/backdrop.jpg',
        posterUrl: '/poster.jpg',
      }),
    ).toBe('https://image.tmdb.org/t/p/w1280/backdrop.jpg');

    expect(
      resolveHomeHeroPrefetchUri({
        backdropUrl: null,
        posterUrl: '/poster.jpg',
      }),
    ).toBe('https://image.tmdb.org/t/p/w780/poster.jpg');
  });
});
