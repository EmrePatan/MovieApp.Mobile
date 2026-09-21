import {
  performHomeSilentReselectRefresh,
  shouldSkipHomeSilentReselectRefresh,
} from '@/features/navigation/home-tab-reselect';

describe('home tab reselect refresh', () => {
  it('silently refetches when the feed is not already fetching', () => {
    const refetch = jest.fn().mockResolvedValue(undefined);

    performHomeSilentReselectRefresh(refetch, false);

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('skips silent refetch while the feed is already fetching', () => {
    const refetch = jest.fn().mockResolvedValue(undefined);

    performHomeSilentReselectRefresh(refetch, true);

    expect(refetch).not.toHaveBeenCalled();
    expect(shouldSkipHomeSilentReselectRefresh(true)).toBe(true);
  });
});
