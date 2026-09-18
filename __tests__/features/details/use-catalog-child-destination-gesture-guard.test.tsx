import { renderHook } from '@testing-library/react-native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCatalogChildDestinationGestureGuard } from '@/features/details/shared/navigation/useCatalogChildDestinationGestureGuard';

jest.mock('expo-router', () => ({
  useNavigation: jest.fn(),
  useFocusEffect: jest.fn(),
}));

describe('useCatalogChildDestinationGestureGuard', () => {
  const rootCatalogSetOptions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useNavigation as jest.Mock).mockReturnValue({
      setOptions: jest.fn(),
      getParent: () => ({
        setOptions: rootCatalogSetOptions,
      }),
    });
    (useFocusEffect as jest.Mock).mockImplementation((callback: () => () => void) => {
      callback();
    });
  });

  it('disables root catalog interactive pop while focused and restores on blur', () => {
    let cleanup: (() => void) | undefined;
    (useFocusEffect as jest.Mock).mockImplementation((callback: () => () => void) => {
      cleanup = callback();
    });

    renderHook(() => useCatalogChildDestinationGestureGuard());

    expect(rootCatalogSetOptions).toHaveBeenCalledWith({ gestureEnabled: false });

    cleanup?.();

    expect(rootCatalogSetOptions).toHaveBeenLastCalledWith({ gestureEnabled: true });
  });
});
