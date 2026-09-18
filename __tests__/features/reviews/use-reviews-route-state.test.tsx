import { renderHook } from '@testing-library/react-native';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { useReviewsRouteState } from '@/features/reviews/hooks/useReviewsRouteState';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useReviewsRouteState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves the catalog id from route params', () => {
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}/reviews`);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: movieId,
      title: 'Interstellar',
    });

    const { result } = renderHook(() => useReviewsRouteState('movie'));

    expect(result.current.resolvedId).toBe(movieId);
    expect(result.current.isInvalid).toBe(false);
    expect(result.current.title).toBe('Interstellar');
  });

  it('keeps the last resolved id when pathname changes during a pop animation', () => {
    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}/reviews`);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: movieId,
      title: 'Interstellar',
    });

    const { result, rerender } = renderHook(() => useReviewsRouteState('movie'));

    expect(result.current.resolvedId).toBe(movieId);

    (usePathname as jest.Mock).mockReturnValue(`/movie/${movieId}`);
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    rerender({});

    expect(result.current.resolvedId).toBe(movieId);
    expect(result.current.isInvalid).toBe(false);
  });
});
