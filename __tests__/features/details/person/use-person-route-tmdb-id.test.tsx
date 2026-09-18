import { renderHook } from '@testing-library/react-native';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { usePersonRouteTmdbId } from '@/features/details/person/hooks/usePersonRouteTmdbId';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

describe('usePersonRouteTmdbId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves the person id from route params', () => {
    (usePathname as jest.Mock).mockReturnValue('/person/1001');
    (useLocalSearchParams as jest.Mock).mockReturnValue({ tmdbId: '1001' });

    const { result } = renderHook(() => usePersonRouteTmdbId());

    expect(result.current.tmdbId).toBe(1001);
    expect(result.current.isPersonPathActive).toBe(true);
    expect(result.current.isInvalid).toBe(false);
  });

  it('keeps the last resolved id when pathname changes during a catalog pop animation', () => {
    (usePathname as jest.Mock).mockReturnValue('/person/1001');
    (useLocalSearchParams as jest.Mock).mockReturnValue({ tmdbId: '1001' });

    const { result, rerender } = renderHook(() => usePersonRouteTmdbId());

    expect(result.current.tmdbId).toBe(1001);

    (usePathname as jest.Mock).mockReturnValue(
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    rerender({});

    expect(result.current.tmdbId).toBe(1001);
    expect(result.current.isPersonPathActive).toBe(false);
    expect(result.current.isInvalid).toBe(false);
  });

  it('restores the person id when returning from a catalog detail screen', () => {
    (usePathname as jest.Mock).mockReturnValue('/person/1001');
    (useLocalSearchParams as jest.Mock).mockReturnValue({ tmdbId: '1001' });

    const { result, rerender } = renderHook(() => usePersonRouteTmdbId());

    (usePathname as jest.Mock).mockReturnValue(
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    rerender({});

    (usePathname as jest.Mock).mockReturnValue('/person/1001');
    (useLocalSearchParams as jest.Mock).mockReturnValue({ tmdbId: '1001' });

    rerender({});

    expect(result.current.tmdbId).toBe(1001);
    expect(result.current.isPersonPathActive).toBe(true);
  });
});
