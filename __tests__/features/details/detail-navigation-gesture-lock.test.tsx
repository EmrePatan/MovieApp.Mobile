import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { useDetailScrollLock } from '@/features/details/shared/context/DetailScrollLockContext';
import { useDetailNavigationGestureLock } from '@/features/details/shared/navigation/useDetailNavigationGestureLock';

const mockSetOptions = jest.fn();
const mockFocusEffect = jest.fn((callback: () => void | (() => void)) => {
  const cleanup = callback();
  return cleanup;
});

jest.mock('expo-router', () => ({
  useNavigation: () => ({
    setOptions: mockSetOptions,
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
    expect(mockSetOptions).not.toHaveBeenCalled();
  });

  it('disables back-swipe only while interaction is locked on focused catalog detail', () => {
    function Probe({ locked }: { locked: boolean }) {
      useDetailNavigationGestureLock(locked, true);
      return null;
    }

    const { rerender } = render(<Probe locked={false} />);
    expect(mockSetOptions).toHaveBeenCalledWith({ gestureEnabled: true });

    rerender(<Probe locked={true} />);
    expect(mockSetOptions).toHaveBeenCalledWith({ gestureEnabled: false });

    rerender(<Probe locked={false} />);
    expect(mockSetOptions).toHaveBeenLastCalledWith({ gestureEnabled: true });
  });
});

describe('DetailQueryState navigation gesture lock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wires rating interaction lock only when enabled for catalog detail', () => {
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

    render(
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
        {() => <RatingLockTrigger />}
      </DetailQueryState>,
    );

    fireEvent.press(screen.getByLabelText('Lock rating interaction'));
    expect(mockSetOptions).toHaveBeenCalledWith({ gestureEnabled: false });
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

    expect(mockSetOptions).not.toHaveBeenCalled();
  });
});
