import { renderHook } from '@testing-library/react-native';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { useCreditsRouteState } from '@/features/details/credits/hooks/useCreditsRouteState';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const otherMovieId = '8f14e45f-ceea-467f-a0fc-57c1f6b9f9f9';

describe('useCreditsRouteState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves the catalog id from route params', () => {
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}/credits`);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: movieId,
      title: 'Interstellar',
    });

    const { result } = renderHook(() => useCreditsRouteState('movie'));

    expect(result.current.resolvedId).toBe(movieId);
    expect(result.current.isInvalid).toBe(false);
    expect(result.current.title).toBe('Interstellar');
  });

  it('keeps the last resolved id when pathname leaves credits during a pop', () => {
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}/credits`);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: movieId,
      title: 'Interstellar',
    });

    const { result, rerender } = renderHook(() => useCreditsRouteState('movie'));

    expect(result.current.resolvedId).toBe(movieId);

    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}`);
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    rerender({});

    expect(result.current.resolvedId).toBe(movieId);
    expect(result.current.isInvalid).toBe(false);
  });

  it('keeps this screen id when another credits route becomes the pathname', () => {
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}/credits`);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: movieId });

    const { result, rerender } = renderHook(() => useCreditsRouteState('movie'));

    (usePathname as jest.Mock).mockReturnValue(`/movie/${otherMovieId}/credits`);
    rerender({});

    expect(result.current.resolvedId).toBe(movieId);
  });
});
