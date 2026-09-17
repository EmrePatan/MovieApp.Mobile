import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { useDetailScrollLock } from '@/features/details/shared/context/DetailScrollLockContext';
import { useDetailNavigationGestureLock } from '@/features/details/shared/navigation/useDetailNavigationGestureLock';

const mockChildSetOptions = jest.fn();
const mockParentSetOptions = jest.fn();
const mockFocusEffect = jest.fn((callback: () => void | (() => void)) => {
  const cleanup = callback();
  return cleanup;
});

jest.mock('expo-router', () => ({
  useNavigation: () => ({
    setOptions: mockChildSetOptions,
    getParent: () => ({
      setOptions: mockParentSetOptions,
    }),
  }),
  useFocusEffect: (callback: () => void | (() => void)) => mockFocusEffect(callback),
}));

describe('useDetailNavigationGestureLock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing when disabled', () => {
    function Probe() {
      useDetailNavigationGestureLock(true, false);
      return null;
    }

    render(<Probe />);
    expect(mockParentSetOptions).not.toHaveBeenCalled();
    expect(mockChildSetOptions).not.toHaveBeenCalled();
  });

  it('disables back-swipe on the parent root navigator while interaction is locked', () => {
    function Probe({ locked }: { locked: boolean }) {
      useDetailNavigationGestureLock(locked, true);
      return null;
    }

    const { rerender } = render(<Probe locked={false} />);
    expect(mockParentSetOptions).toHaveBeenCalledWith({ gestureEnabled: true });
    expect(mockChildSetOptions).not.toHaveBeenCalled();

    rerender(<Probe locked={true} />);
    expect(mockParentSetOptions).toHaveBeenCalledWith({ gestureEnabled: false });

    rerender(<Probe locked={false} />);
    expect(mockParentSetOptions).toHaveBeenLastCalledWith({ gestureEnabled: true });
  });

  it('restores parent gestures on blur cleanup', () => {
    let cleanup: void | (() => void);
    mockFocusEffect.mockImplementationOnce((callback: () => void | (() => void)) => {
      cleanup = callback();
    });

    function Probe() {
      useDetailNavigationGestureLock(false, true);
      return null;
    }

    render(<Probe />);
    cleanup?.();

    expect(mockParentSetOptions).toHaveBeenLastCalledWith({ gestureEnabled: true });
  });
});

describe('DetailQueryState navigation gesture lock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderRatingLockProbe() {
    function RatingLockTrigger() {
      const scrollLock = useDetailScrollLock();

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lock rating interaction"
          onPress={() => scrollLock?.setScrollLocked(true)}
        >
          <Text>detail</Text>
        </Pressable>
      );
    }

    function RatingUnlockTrigger() {
      const scrollLock = useDetailScrollLock();

      return (
        <>
          <RatingLockTrigger />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Unlock rating interaction"
            onPress={() => scrollLock?.setScrollLocked(false)}
          >
            <Text>unlock</Text>
          </Pressable>
        </>
      );
    }

    return render(
      <DetailQueryState
        enableRatingNavigationGestureLock
        query={{
          data: { title: 'Example' },
          error: null,
          isLoading: false,
          isError: false,
          refetch: jest.fn(),
        }}
        notFoundTitle="Not found"
        notFoundMessage="Missing"
      >
        {() => <RatingUnlockTrigger />}
      </DetailQueryState>,
    );
  }

  it('synchronously disables the parent root navigator when rating interaction starts', () => {
    renderRatingLockProbe();

    fireEvent.press(screen.getByLabelText('Lock rating interaction'));
    expect(mockParentSetOptions).toHaveBeenCalledWith({ gestureEnabled: false });
    expect(mockChildSetOptions).not.toHaveBeenCalled();
  });

  it('restores the parent root navigator when rating interaction ends', () => {
    renderRatingLockProbe();

    fireEvent.press(screen.getByLabelText('Lock rating interaction'));
    fireEvent.press(screen.getByLabelText('Unlock rating interaction'));
    expect(mockParentSetOptions).toHaveBeenLastCalledWith({ gestureEnabled: true });
  });

  it('does not wire rating interaction lock for non-catalog detail screens', () => {
    render(
      <DetailQueryState
        query={{
          data: { title: 'Example' },
          error: null,
          isLoading: false,
          isError: false,
          refetch: jest.fn(),
        }}
        notFoundTitle="Not found"
        notFoundMessage="Missing"
      >
        {() => <Text>child destination</Text>}
      </DetailQueryState>,
    );

    expect(mockParentSetOptions).not.toHaveBeenCalled();
    expect(mockChildSetOptions).not.toHaveBeenCalled();
  });
});
