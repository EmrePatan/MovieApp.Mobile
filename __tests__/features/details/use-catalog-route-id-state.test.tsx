import { renderHook } from '@testing-library/react-native';
import { usePathname } from 'expo-router';
import { useCatalogRouteIdState } from '@/features/details/shared/hooks/useCatalogRouteId';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useCatalogRouteIdState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not resolve an id on child destinations like reviews', () => {
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}/reviews`);

    const { result } = renderHook(() => useCatalogRouteIdState('movie'));

    expect(result.current.resolvedId).toBeUndefined();
    expect(result.current.isDetailPathActive).toBe(false);
    expect(result.current.isInvalid).toBe(false);
  });

  it('resolves the catalog id from the active pathname on the detail index route', () => {
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}`);

    const { result } = renderHook(() => useCatalogRouteIdState('movie'));

    expect(result.current.resolvedId).toBe(movieId);
    expect(result.current.isDetailPathActive).toBe(true);
    expect(result.current.isInvalid).toBe(false);
  });

  it('does not keep a previous catalog id when the pathname changes to another detail', () => {
    const nextMovieId = '8f14e45f-ceea-467f-a0fc-57c1f6b9f9f9';
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}`);

    const { result, rerender } = renderHook(() => useCatalogRouteIdState('movie'));
    expect(result.current.resolvedId).toBe(movieId);

    (usePathname as jest.Mock).mockReturnValue(`/movie/${nextMovieId}`);
    rerender({});

    expect(result.current.resolvedId).toBe(nextMovieId);
    expect(result.current.resolvedId).not.toBe(movieId);
  });

  it('returns null detail state when the pathname is not a catalog detail route', () => {
    (usePathname as jest.Mock).mockReturnValue('/collection/9485');

    const { result } = renderHook(() => useCatalogRouteIdState('movie'));

    expect(result.current.resolvedId).toBeUndefined();
    expect(result.current.isDetailPathActive).toBe(false);
  });

  it('marks invalid detail routes when the pathname segment is not a guid', () => {
    (usePathname as jest.Mock).mockReturnValue('/movie/not-a-guid');

    const { result } = renderHook(() => useCatalogRouteIdState('movie'));

    expect(result.current.resolvedId).toBeUndefined();
    expect(result.current.isDetailPathActive).toBe(false);
    expect(result.current.isInvalid).toBe(true);
  });
});
