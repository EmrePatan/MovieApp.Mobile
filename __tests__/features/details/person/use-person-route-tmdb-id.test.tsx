import { renderHook } from '@testing-library/react-native';
import { useIsFocused, useLocalSearchParams, usePathname } from 'expo-router';
import { usePersonRouteTmdbId } from '@/features/details/person/hooks/usePersonRouteTmdbId';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useIsFocused: jest.fn(() => true),
}));

describe('usePersonRouteTmdbId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useIsFocused as jest.Mock).mockReturnValue(true);
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

  it('prefers the pathname person id when route params are stale', () => {
    (usePathname as jest.Mock).mockReturnValue('/person/2002');
    (useLocalSearchParams as jest.Mock).mockReturnValue({ tmdbId: '1001' });

    const { result } = renderHook(() => usePersonRouteTmdbId());

    expect(result.current.tmdbId).toBe(2002);
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

  it('keeps this person id when another person route is focused on top', () => {
    (usePathname as jest.Mock).mockReturnValue('/person/1001');
    (useLocalSearchParams as jest.Mock).mockReturnValue({ tmdbId: '1001' });

    const { result, rerender } = renderHook(() => usePersonRouteTmdbId());

    expect(result.current.tmdbId).toBe(1001);

    (useIsFocused as jest.Mock).mockReturnValue(false);
    (usePathname as jest.Mock).mockReturnValue('/person/2002');
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    rerender({});

    expect(result.current.tmdbId).toBe(1001);
    expect(result.current.isPersonPathActive).toBe(false);
  });
});
