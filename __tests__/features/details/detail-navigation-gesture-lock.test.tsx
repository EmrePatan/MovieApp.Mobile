import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { useDetailScrollLock } from '@/features/details/shared/context/DetailScrollLockContext';
import { useDetailNavigationGestureLock } from '@/features/details/shared/navigation/useDetailNavigationGestureLock';

const mockSetOptions = jest.fn();

jest.mock('expo-router', () => ({
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
}));

describe('useDetailNavigationGestureLock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables back-swipe only while interaction is locked', () => {
    function Probe({ locked }: { locked: boolean }) {
      useDetailNavigationGestureLock(locked);
      return null;
    }

    const { rerender, unmount } = render(<Probe locked={false} />);
    expect(mockSetOptions).toHaveBeenCalledWith({ gestureEnabled: true });

    rerender(<Probe locked={true} />);
    expect(mockSetOptions).toHaveBeenCalledWith({ gestureEnabled: false });

    rerender(<Probe locked={false} />);
    expect(mockSetOptions).toHaveBeenLastCalledWith({ gestureEnabled: true });

    unmount();
    expect(mockSetOptions).toHaveBeenLastCalledWith({ gestureEnabled: true });
  });
});

describe('DetailQueryState navigation gesture lock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wires rating interaction lock to navigation gesture options', () => {
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
});
