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

  it('walks nested catalog stacks to reach the root movie or tv screen', () => {
    const rootCatalogSetOptions = jest.fn();
    const tvLayoutSetOptions = jest.fn();
    const innerStackSetOptions = jest.fn();
    const reviewsSetOptions = jest.fn();

    const rootStackNavigation = { setOptions: jest.fn() };
    const rootCatalogNavigation = {
      setOptions: rootCatalogSetOptions,
      getParent: () => rootStackNavigation,
    };
    const tvLayoutNavigation = {
      setOptions: tvLayoutSetOptions,
      getParent: () => rootCatalogNavigation,
    };
    const innerStackNavigation = {
      setOptions: innerStackSetOptions,
      getParent: () => tvLayoutNavigation,
    };
    const reviewsNavigation = {
      setOptions: reviewsSetOptions,
      getParent: () => innerStackNavigation,
    };

    expect(resolveCatalogDetailGestureNavigation(reviewsNavigation)).toBe(
      rootCatalogNavigation,
    );
    setCatalogDetailGestureEnabled(reviewsNavigation, false);

    expect(rootCatalogSetOptions).toHaveBeenCalledWith({ gestureEnabled: false });
    expect(tvLayoutSetOptions).not.toHaveBeenCalled();
    expect(innerStackSetOptions).not.toHaveBeenCalled();
    expect(reviewsSetOptions).not.toHaveBeenCalled();
  });

  it('falls back to the current navigator when no parent exists', () => {
    const setOptions = jest.fn();
    const navigation = { setOptions };

    expect(resolveCatalogDetailGestureNavigation(navigation)).toBe(navigation);
    setCatalogDetailGestureEnabled(navigation, true);
    expect(setOptions).toHaveBeenCalledWith({ gestureEnabled: true });
  });
});
