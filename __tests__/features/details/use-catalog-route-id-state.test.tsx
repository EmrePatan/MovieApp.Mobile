import { renderHook } from '@testing-library/react-native';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { useCatalogRouteIdState } from '@/features/details/shared/hooks/useCatalogRouteId';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const recommendedId = '8f14e45f-ceea-467f-a0fc-57c1f6b9f9f9';

describe('useCatalogRouteIdState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves the catalog id from its own route params', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: movieId });

    const { result } = renderHook(() => useCatalogRouteIdState());

    expect(result.current.resolvedId).toBe(movieId);
    expect(result.current.isDetailPathActive).toBe(true);
    expect(result.current.isInvalid).toBe(false);
  });

  it('keeps detail A underneath when recommended detail B becomes the active pathname', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: movieId });
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}`);

    const { result, rerender } = renderHook(() => useCatalogRouteIdState());
    expect(result.current.resolvedId).toBe(movieId);

    (usePathname as jest.Mock).mockReturnValue(`/movie/${recommendedId}`);
    rerender({});

    expect(result.current.resolvedId).toBe(movieId);
  });

  it('stays resolved while a child destination like reviews is on top', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: movieId });
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}/reviews`);

    const { result } = renderHook(() => useCatalogRouteIdState());

    expect(result.current.resolvedId).toBe(movieId);
    expect(result.current.isDetailPathActive).toBe(true);
  });

  it('marks invalid detail routes when the id param is not a guid', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'not-a-guid' });

    const { result } = renderHook(() => useCatalogRouteIdState());

    expect(result.current.resolvedId).toBeUndefined();
    expect(result.current.isDetailPathActive).toBe(false);
    expect(result.current.isInvalid).toBe(true);
  });
});
