import { resolveImageUri } from '@/utils/image-url';

describe('Library posterUrl resolution', () => {
  const originalEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalEnv;
  });

  it('resolves real production catalog poster paths into reachable TMDB URLs', () => {
    const libraryPosterUrls = [
      '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
      '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
      '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    ];

    for (const posterUrl of libraryPosterUrls) {
      expect(resolveImageUri(posterUrl)).toBe(
        `https://image.tmdb.org/t/p/w500${posterUrl}`,
      );
    }
  });

  it('matches pre-media resolution for the runtime w500 base', () => {
    const posterUrl = '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg';
    const base = 'https://image.tmdb.org/t/p/w500';
    const preMediaUri = `${base}${posterUrl}`;

    expect(resolveImageUri(posterUrl)).toBe(preMediaUri);
  });
});
