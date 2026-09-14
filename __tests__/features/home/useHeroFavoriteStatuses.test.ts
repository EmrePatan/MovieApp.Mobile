import { heroFavoriteStatusesQueryKey } from '@/features/home/hooks/useHeroFavoriteStatuses';
import type { HomeItem } from '@/features/home/types';

function createItem(overrides: Partial<HomeItem> = {}): HomeItem {
  return {
    id: overrides.id ?? 'item-id',
    contentType: overrides.contentType ?? 'movie',
    title: overrides.title ?? 'Test Title',
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7.5,
    voteCount: 100,
    ...overrides,
  };
}

describe('heroFavoriteStatusesQueryKey', () => {
  it('builds a stable key from hero content identity', () => {
    const items = [
      createItem({ id: 'movie-1', contentType: 'movie' }),
      createItem({ id: 'tv-1', contentType: 'tv' }),
    ];

    expect(heroFavoriteStatusesQueryKey(items)).toEqual([
      'favorites',
      'hero-batch',
      'movie:movie-1|tv:tv-1',
    ]);
  });
});
