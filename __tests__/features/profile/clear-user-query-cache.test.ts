import { clearUserQueryCache } from '@/features/profile/utils/clear-user-query-cache';

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
});
