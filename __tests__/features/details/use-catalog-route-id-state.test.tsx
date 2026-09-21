import { renderHook } from '@testing-library/react-native';
import { useLocalSearchParams, usePathname, useSegments } from 'expo-router';
import { useCatalogRouteIdState } from '@/features/details/shared/hooks/useCatalogRouteId';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useSegments: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useCatalogRouteIdState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the catalog id while a child destination like reviews is focused', () => {
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}/reviews`);
    (useSegments as jest.Mock).mockReturnValue(['movie', '[id]', 'reviews']);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ title: 'Interstellar' });

    const { result } = renderHook(() => useCatalogRouteIdState('movie'));

    expect(result.current.resolvedId).toBe(movieId);
    expect(result.current.isDetailPathActive).toBe(false);
    expect(result.current.isInvalid).toBe(false);
  });

  it('marks the detail route active on the catalog pathname', () => {
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}`);
    (useSegments as jest.Mock).mockReturnValue(['movie', movieId]);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: movieId });

    const { result } = renderHook(() => useCatalogRouteIdState('movie'));

    expect(result.current.resolvedId).toBe(movieId);
    expect(result.current.isDetailPathActive).toBe(true);
  });

  it('does not carry a previous catalog id into a newly opened detail route', () => {
    const nextMovieId = '8f14e45f-ceea-467f-a0fc-57c1f6b9f9f9';
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}`);
    (useSegments as jest.Mock).mockReturnValue(['movie', movieId]);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: movieId });

    const { result, rerender } = renderHook(() => useCatalogRouteIdState('movie'));
    expect(result.current.resolvedId).toBe(movieId);

    (usePathname as jest.Mock).mockReturnValue(`/movie/${nextMovieId}`);
    (useSegments as jest.Mock).mockReturnValue(['movie', nextMovieId]);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: nextMovieId });
    rerender({});

    expect(result.current.resolvedId).toBe(nextMovieId);
    expect(result.current.resolvedId).not.toBe(movieId);
  });
});
