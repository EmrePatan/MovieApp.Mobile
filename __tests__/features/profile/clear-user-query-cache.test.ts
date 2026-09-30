import { clearUserQueryCache } from '@/features/profile/utils/clear-user-query-cache';
import { clearHomePersonalizedCacheForUser } from '@/features/home/storage/home-personalized-cache';

jest.mock('@/features/home/storage/home-personalized-cache', () => ({
  clearHomePersonalizedCacheForUser: jest.fn(),
}));

describe('clear user query cache', () => {
  it('removes user-specific query prefixes', () => {
    const removeQueries = jest.fn();
    const queryClient = { removeQueries } as never;

    clearUserQueryCache(queryClient);

    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['profile'] });
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['favorites'] });
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['watchlists'] });
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['watch-history'] });
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['reviews'] });
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['search-history'] });
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['home'] });
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ['notifications'] });
  });

  it('clears persisted personalized home cache for the signing-out user', () => {
    const removeQueries = jest.fn();
    const queryClient = { removeQueries } as never;

    clearUserQueryCache(queryClient, 'user-42');

    expect(clearHomePersonalizedCacheForUser).toHaveBeenCalledWith('user-42');
  });

  it('removes personalized library, insights, recommendation and follow caches', () => {
    const removeQueries = jest.fn();
    const queryClient = { removeQueries } as never;

    clearUserQueryCache(queryClient);

    for (const root of [
      'library',
      'insights',
      'recommendations',
      'ai-recommendations',
      'following',
      'movie-follow-status',
      'tv-show-follow-status',
    ]) {
      expect(removeQueries).toHaveBeenCalledWith({ queryKey: [root] });
    }
  });
});
