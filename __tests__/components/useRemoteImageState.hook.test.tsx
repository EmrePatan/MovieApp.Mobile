import { act, renderHook } from '@testing-library/react-native';
import {
  REMOTE_IMAGE_LOAD_TIMEOUT_MS,
  useRemoteImageState,
} from '@/hooks/useRemoteImageState';

jest.mock('react', () => jest.requireActual('react'));

describe('useRemoteImageState hook lifecycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('falls back after a hung load', () => {
    const { result } = renderHook(() =>
      useRemoteImageState('https://example.com/stuck.jpg'),
    );

    act(() => {
      result.current.markLoading();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.showFallback).toBe(false);

    act(() => {
      jest.advanceTimersByTime(REMOTE_IMAGE_LOAD_TIMEOUT_MS);
    });

    expect(result.current.showFallback).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('keeps a loaded image visible after the timeout window', () => {
    const { result } = renderHook(() =>
      useRemoteImageState('https://example.com/good.jpg'),
    );

    act(() => {
      result.current.markLoading();
      result.current.markLoaded();
    });

    act(() => {
      jest.advanceTimersByTime(REMOTE_IMAGE_LOAD_TIMEOUT_MS);
    });

    expect(result.current.showFallback).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('cancels a stale timeout when the source changes', () => {
    const { result, rerender } = renderHook(
      ({ uri }) => useRemoteImageState(uri),
      { initialProps: { uri: 'https://example.com/first.jpg' } },
    );

    act(() => {
      result.current.markLoading();
    });

    rerender({ uri: 'https://example.com/second.jpg' });

    act(() => {
      result.current.markLoaded();
    });

    act(() => {
      jest.advanceTimersByTime(REMOTE_IMAGE_LOAD_TIMEOUT_MS);
    });

    expect(result.current.showFallback).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('marks missing sources as fallback without waiting for timeout', () => {
    const { result } = renderHook(() => useRemoteImageState(null));

    expect(result.current.showFallback).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });
});
