import { renderHook } from '@testing-library/react-native';
import { useFollowingCount } from '@/features/following/hooks/useFollowingCount';
import { useFollowingCatalog } from '@/features/following/hooks/useFollowingCatalog';

jest.mock('@/features/following/hooks/useFollowingCatalog', () => ({
  useFollowingCatalog: jest.fn(),
}));

describe('useFollowingCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests the lightweight following catalog page size', () => {
    (useFollowingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ totalCount: 7 }] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    renderHook(() => useFollowingCount());

    expect(useFollowingCatalog).toHaveBeenCalledWith(1);
  });

  it('returns totalCount from the first page', () => {
    (useFollowingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ totalCount: 9 }] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    const { result } = renderHook(() => useFollowingCount());

    expect(result.current.totalCount).toBe(9);
  });

  it('defaults totalCount to zero when data is unavailable', () => {
    (useFollowingCatalog as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    const { result } = renderHook(() => useFollowingCount());

    expect(result.current.totalCount).toBe(0);
    expect(result.current.isLoading).toBe(true);
  });
});
