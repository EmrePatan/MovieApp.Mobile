import {
  resolveCatalogDetailGestureNavigation,
  setCatalogDetailGestureEnabled,
} from '@/features/details/shared/navigation/catalog-detail-gesture-navigation';

describe('catalog detail gesture navigation', () => {
  it('targets the parent navigator that owns root interactive pop', () => {
    const parentSetOptions = jest.fn();
    const childSetOptions = jest.fn();
    const parentNavigation = { setOptions: parentSetOptions };
    const navigation = {
      setOptions: childSetOptions,
      getParent: () => parentNavigation,
    };

    expect(resolveCatalogDetailGestureNavigation(navigation)).toBe(parentNavigation);
    setCatalogDetailGestureEnabled(navigation, false);

    expect(parentSetOptions).toHaveBeenCalledWith({ gestureEnabled: false });
    expect(childSetOptions).not.toHaveBeenCalled();
  });

  it('falls back to the current navigator when no parent exists', () => {
    const setOptions = jest.fn();
    const navigation = { setOptions };

    expect(resolveCatalogDetailGestureNavigation(navigation)).toBe(navigation);
    setCatalogDetailGestureEnabled(navigation, true);
    expect(setOptions).toHaveBeenCalledWith({ gestureEnabled: true });
  });
});
