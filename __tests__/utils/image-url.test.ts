import {
  buildTmdbImageUrl,
  getImageBaseUrl,
  normalizeImagePathInput,
  normalizeTmdbAbsoluteUrl,
  normalizeTmdbFilePath,
  resolveImageUri,
  resolveProviderLogoUri,
} from '@/utils/image-url';

describe('normalizeImagePathInput', () => {
  it('converts protocol-relative TMDB URLs to https', () => {
    expect(
      normalizeImagePathInput('//image.tmdb.org/t/p/w500/abc.jpg'),
    ).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
  });
});

describe('normalizeTmdbFilePath', () => {
  it('keeps plain TMDB file paths unchanged', () => {
    expect(normalizeTmdbFilePath('/abc.jpg')).toBe('/abc.jpg');
  });

  it('strips a leading TMDB size segment', () => {
    expect(normalizeTmdbFilePath('/w500/abc.jpg')).toBe('/abc.jpg');
  });

  it('strips a leading original segment', () => {
    expect(normalizeTmdbFilePath('/original/abc.jpg')).toBe('/abc.jpg');
  });
});

describe('buildTmdbImageUrl', () => {
  it('inserts the requested size segment once', () => {
    expect(buildTmdbImageUrl('/abc.jpg', 'w500')).toBe(
      'https://image.tmdb.org/t/p/w500/abc.jpg',
    );
  });
});

describe('normalizeTmdbAbsoluteUrl', () => {
  it('adds a missing size segment', () => {
    expect(
      normalizeTmdbAbsoluteUrl('https://image.tmdb.org/t/p/abc.jpg', 'w500'),
    ).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
  });

  it('deduplicates an embedded size segment in the file path', () => {
    expect(
      normalizeTmdbAbsoluteUrl('https://image.tmdb.org/t/p/w500/w500/abc.jpg', 'w500'),
    ).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
  });
});

describe('resolveImageUri', () => {
  const originalEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalEnv;
  });

  it('returns null for missing paths', () => {
    expect(resolveImageUri(null)).toBeNull();
    expect(resolveImageUri('')).toBeNull();
  });

  it('uses the TMDB CDN for relative paths when no base URL is configured', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
    expect(getImageBaseUrl()).toBeNull();
    expect(resolveImageUri('/path.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/path.jpg',
    );
    expect(resolveProviderLogoUri('/netflix.png')).toBe(
      'https://image.tmdb.org/t/p/w92/netflix.png',
    );
  });

  it('returns non-TMDB absolute URLs unchanged', () => {
    expect(resolveImageUri('https://example.com/poster.jpg')).toBe(
      'https://example.com/poster.jpg',
    );
  });

  it('builds non-TMDB relative paths when EXPO_PUBLIC_IMAGE_BASE_URL is configured', () => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://images.example.com/';
    expect(resolveImageUri('/path.jpg')).toBe('https://images.example.com/path.jpg');
  });

  const tmdbCases: Array<{
    name: string;
    base: string;
    path: string;
    size?: 'w300' | 'w500' | 'original';
    expected: string;
  }> = [
    {
      name: 'library poster path with TMDB base without size',
      base: 'https://image.tmdb.org/t/p',
      path: '/poster.jpg',
      expected: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    },
    {
      name: 'library poster path with TMDB base including size',
      base: 'https://image.tmdb.org/t/p/w500',
      path: '/poster.jpg',
      expected: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    },
    {
      name: 'path already containing size with sized base',
      base: 'https://image.tmdb.org/t/p/w500',
      path: '/w500/abc.jpg',
      expected: 'https://image.tmdb.org/t/p/w500/abc.jpg',
    },
    {
      name: 'path already containing size with unsized base',
      base: 'https://image.tmdb.org/t/p',
      path: '/w500/abc.jpg',
      expected: 'https://image.tmdb.org/t/p/w500/abc.jpg',
    },
    {
      name: 'thumbnail size override',
      base: 'https://image.tmdb.org/t/p',
      path: '/poster.jpg',
      size: 'w300',
      expected: 'https://image.tmdb.org/t/p/w300/poster.jpg',
    },
    {
      name: 'original size override',
      base: 'https://image.tmdb.org/t/p/w500',
      path: '/poster.jpg',
      size: 'original',
      expected: 'https://image.tmdb.org/t/p/original/poster.jpg',
    },
    {
      name: 'fake seeded library path',
      base: 'https://image.tmdb.org/t/p',
      path: '/fake/breaking-bad-poster.jpg',
      expected: 'https://image.tmdb.org/t/p/w500/fake/breaking-bad-poster.jpg',
    },
    {
      name: 'path without leading slash',
      base: 'https://image.tmdb.org/t/p',
      path: 'abc.jpg',
      expected: 'https://image.tmdb.org/t/p/w500/abc.jpg',
    },
  ];

  it.each(tmdbCases)('$name', ({ base, path, size, expected }) => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = base;
    expect(resolveImageUri(path, size)).toBe(expected);
  });

  it('normalizes absolute TMDB URLs missing a size segment', () => {
    expect(resolveImageUri('https://image.tmdb.org/t/p/abc.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/abc.jpg',
    );
  });

  it('normalizes absolute TMDB URLs that already include a size segment', () => {
    expect(resolveImageUri('https://image.tmdb.org/t/p/w500/abc.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/abc.jpg',
    );
  });

  it('deduplicates double-sized absolute TMDB URLs', () => {
    expect(resolveImageUri('https://image.tmdb.org/t/p/w500/w500/abc.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/abc.jpg',
    );
  });

  it('resolves protocol-relative TMDB URLs', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
    expect(resolveImageUri('//image.tmdb.org/t/p/w500/abc.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/abc.jpg',
    );
  });
});
