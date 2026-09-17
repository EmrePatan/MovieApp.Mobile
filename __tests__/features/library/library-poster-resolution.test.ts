import { resolveImageUri } from '@/utils/image-url';

describe('Library posterUrl resolution', () => {
  const originalEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalEnv;
  });

  it('resolves watched/all library posterUrl values into valid TMDB URLs', () => {
    const libraryPosterUrls = [
      '/poster.jpg',
      '/fake/breaking-bad-poster.jpg',
      '/fake/interstellar-poster.jpg',
    ];

    for (const posterUrl of libraryPosterUrls) {
      expect(resolveImageUri(posterUrl)).toMatch(
        /^https:\/\/image\.tmdb\.org\/t\/p\/w500\/.+\.jpg$/,
      );
    }
  });

  it('maps a representative watched item poster field to the Image source URI', () => {
    const watchedItem = {
      id: 'movie-42',
      type: 'movie' as const,
      title: 'Interstellar',
      posterUrl: '/fake/interstellar-poster.jpg',
    };

    expect(resolveImageUri(watchedItem.posterUrl)).toBe(
      'https://image.tmdb.org/t/p/w500/fake/interstellar-poster.jpg',
    );
  });
});
