import { renderHook } from '@testing-library/react-native';
import { useFocusEffect } from 'expo-router';
import { setCatalogDetailGestureEnabled } from '@/features/details/shared/navigation/catalog-detail-gesture-navigation';
import { useCatalogChildDestinationGestureGuard } from '@/features/details/shared/navigation/useCatalogChildDestinationGestureGuard';

jest.mock('expo-router', () => ({
  useNavigation: jest.fn(() => ({ setOptions: jest.fn() })),
  useFocusEffect: jest.fn(),
}));

jest.mock('@/features/details/shared/navigation/catalog-detail-gesture-navigation', () => ({
  setCatalogDetailGestureEnabled: jest.fn(),
}));

describe('useCatalogChildDestinationGestureGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables root catalog interactive pop while focused and restores on blur', () => {
    const navigation = { setOptions: jest.fn() };
    let cleanup: (() => void) | undefined;

    (useFocusEffect as jest.Mock).mockImplementation((callback: () => () => void) => {
      cleanup = callback();
    });

    renderHook(() => useCatalogChildDestinationGestureGuard());

    expect(setCatalogDetailGestureEnabled).toHaveBeenCalledWith(expect.anything(), false);

    cleanup?.();

    expect(setCatalogDetailGestureEnabled).toHaveBeenLastCalledWith(expect.anything(), true);
  });
});
