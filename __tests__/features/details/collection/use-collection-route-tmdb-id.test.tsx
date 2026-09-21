import { renderHook } from '@testing-library/react-native';
import { usePathname } from 'expo-router';
import { useCollectionRouteTmdbId } from '@/features/details/collection/hooks/useCollectionRouteTmdbId';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
}));

describe('useCollectionRouteTmdbId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves the collection id from the pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/collection/9485');

    const { result } = renderHook(() => useCollectionRouteTmdbId());

    expect(result.current.tmdbId).toBe(9485);
    expect(result.current.isActive).toBe(true);
    expect(result.current.isInvalid).toBe(false);
  });

  it('does not resolve a collection id from non-collection routes', () => {
    (usePathname as jest.Mock).mockReturnValue(
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );

    const { result } = renderHook(() => useCollectionRouteTmdbId());

    expect(result.current.tmdbId).toBeNull();
    expect(result.current.isActive).toBe(false);
    expect(result.current.isInvalid).toBe(false);
  });

  it('marks invalid collection routes when the pathname segment is not numeric', () => {
    (usePathname as jest.Mock).mockReturnValue('/collection/not-a-number');

    const { result } = renderHook(() => useCollectionRouteTmdbId());

    expect(result.current.tmdbId).toBeNull();
    expect(result.current.isActive).toBe(false);
    expect(result.current.isInvalid).toBe(true);
  });
});
