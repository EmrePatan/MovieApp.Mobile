import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HOME_PERSONALIZED_CACHE_MAX_AGE_MS,
  HOME_PERSONALIZED_CACHE_SCHEMA_VERSION,
  buildHomePersonalizedCacheStorageKey,
  clearHomePersonalizedCacheForUser,
  readHomePersonalizedCache,
  writeHomePersonalizedCache,
} from '@/features/home/storage/home-personalized-cache';
import type { HomePersonalizedResponse } from '@/features/home/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

const sampleResponse: HomePersonalizedResponse = {
  isPersonalized: true,
  generatedAtUtc: '2026-01-01T00:00:00Z',
  sections: [
    {
      type: 'RecommendedForYou',
      title: 'Recommended For You',
      displayOrder: 1,
      items: [
        {
          id: 'movie-1',
          contentType: 'movie',
          title: 'Cached Movie',
          originalTitle: null,
          posterUrl: null,
          backdropUrl: null,
          releaseDate: null,
          voteAverage: 8,
          voteCount: 10,
        },
      ],
    },
  ],
};

describe('home personalized persistent cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isolates cache keys by user and request dimensions', () => {
    expect(buildHomePersonalizedCacheStorageKey('user-a', 'all', 10, 'TR')).toBe(
      'movieapp:home-personalized:v1:user-a:all:10:TR',
    );
    expect(buildHomePersonalizedCacheStorageKey('user-b', 'movie', 5, 'US')).not.toBe(
      buildHomePersonalizedCacheStorageKey('user-a', 'movie', 5, 'US'),
    );
  });

  it('reads a valid cached response', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        version: HOME_PERSONALIZED_CACHE_SCHEMA_VERSION,
        cachedAt: Date.now(),
        response: sampleResponse,
      }),
    );

    const result = await readHomePersonalizedCache('user-a', 'all', 10, 'TR');
    expect(result).toEqual(sampleResponse);
  });

  it('ignores expired cache entries', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        version: HOME_PERSONALIZED_CACHE_SCHEMA_VERSION,
        cachedAt: Date.now() - HOME_PERSONALIZED_CACHE_MAX_AGE_MS - 1,
        response: sampleResponse,
      }),
    );

    const result = await readHomePersonalizedCache('user-a', 'all', 10, 'TR');
    expect(result).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalled();
  });

  it('ignores malformed cache payloads', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{not-json');

    const result = await readHomePersonalizedCache('user-a', 'all', 10, 'TR');
    expect(result).toBeNull();
  });

  it('persists successful responses', async () => {
    await writeHomePersonalizedCache('user-a', 'all', 10, 'TR', sampleResponse);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      buildHomePersonalizedCacheStorageKey('user-a', 'all', 10, 'TR'),
      expect.stringContaining('"Cached Movie"'),
    );
  });

  it('clears only the targeted user cache entries on logout', async () => {
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
      buildHomePersonalizedCacheStorageKey('user-a', 'all', 10, 'TR'),
      buildHomePersonalizedCacheStorageKey('user-b', 'all', 10, 'TR'),
    ]);

    await clearHomePersonalizedCacheForUser('user-a');

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      buildHomePersonalizedCacheStorageKey('user-a', 'all', 10, 'TR'),
    ]);
  });
});
