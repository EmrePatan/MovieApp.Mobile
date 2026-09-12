import { renderHook, act } from '@testing-library/react-native';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delayMs }) => useDebouncedValue(value, delayMs),
      {
        initialProps: { value: 'a', delayMs: 300 },
      },
    );

    expect(result.current).toBe('a');

    rerender({ value: 'abc', delayMs: 300 });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('abc');
  });
});
