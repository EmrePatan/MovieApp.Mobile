import { act, renderHook } from '@testing-library/react-native';
import { useRemoteImageLoadState } from '@/hooks/useRemoteImageLoadState';

describe('useRemoteImageLoadState', () => {
  it('ignores stale onError after the source key changes', () => {
    const { result, rerender } = renderHook(
      ({ sourceKey }) => useRemoteImageLoadState(sourceKey),
      { initialProps: { sourceKey: 'https://image.tmdb.org/t/p/w500/a.jpg' } },
    );

    const staleError = result.current.onImageError;

    rerender({ sourceKey: 'https://image.tmdb.org/t/p/w500/b.jpg' });

    act(() => {
      staleError();
    });

    expect(result.current.hasError).toBe(false);
    expect(result.current.imageKey).toBe('https://image.tmdb.org/t/p/w500/b.jpg:0');
  });

  it('ignores onError after a successful load', () => {
    const { result } = renderHook(() =>
      useRemoteImageLoadState('https://image.tmdb.org/t/p/w500/a.jpg'),
    );

    act(() => {
      result.current.onImageLoad();
    });

    act(() => {
      result.current.onImageError();
    });

    expect(result.current.hasError).toBe(false);
    expect(result.current.imageKey).toBe('https://image.tmdb.org/t/p/w500/a.jpg:0');
  });

  it('ignores stale onError from a remounted retry attempt', () => {
    const { result } = renderHook(() =>
      useRemoteImageLoadState('https://image.tmdb.org/t/p/w500/a.jpg'),
    );

    const firstAttemptError = result.current.onImageError;

    act(() => {
      result.current.onImageError();
    });

    act(() => {
      firstAttemptError();
    });

    expect(result.current.hasError).toBe(false);
    expect(result.current.imageKey).toBe('https://image.tmdb.org/t/p/w500/a.jpg:1');
  });
});
