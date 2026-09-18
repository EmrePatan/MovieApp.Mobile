import {
  buildCatalogDetailGestureOptions,
  resolveCatalogDetailGestureNavigation,
  setCatalogDetailGestureEnabled,
  setCatalogDetailRatingGestureLock,
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

    expect(parentSetOptions).toHaveBeenCalledWith(
      buildCatalogDetailGestureOptions(false),
    );
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

    expect(rootCatalogSetOptions).toHaveBeenCalledWith(
      buildCatalogDetailGestureOptions(false),
    );
    expect(tvLayoutSetOptions).not.toHaveBeenCalled();
    expect(innerStackSetOptions).not.toHaveBeenCalled();
    expect(reviewsSetOptions).not.toHaveBeenCalled();
  });

  it('targets the root catalog screen from catalog detail index depth', () => {
    const rootCatalogSetOptions = jest.fn();
    const movieLayoutSetOptions = jest.fn();
    const catalogStackSetOptions = jest.fn();
    const indexSetOptions = jest.fn();

    const rootStackNavigation = { setOptions: jest.fn() };
    const rootCatalogNavigation = {
      setOptions: rootCatalogSetOptions,
      getParent: () => rootStackNavigation,
    };
    const movieLayoutNavigation = {
      setOptions: movieLayoutSetOptions,
      getParent: () => rootCatalogNavigation,
    };
    const catalogStackNavigation = {
      setOptions: catalogStackSetOptions,
      getParent: () => movieLayoutNavigation,
    };
    const indexNavigation = {
      setOptions: indexSetOptions,
      getParent: () => catalogStackNavigation,
    };

    expect(resolveCatalogDetailGestureNavigation(indexNavigation)).toBe(
      rootCatalogNavigation,
    );
  });

  it('falls back to the current navigator when no parent exists', () => {
    const setOptions = jest.fn();
    const navigation = { setOptions };

    expect(resolveCatalogDetailGestureNavigation(navigation)).toBe(navigation);
    setCatalogDetailGestureEnabled(navigation, true);
    expect(setOptions).toHaveBeenCalledWith(buildCatalogDetailGestureOptions(true));
  });

  it('locks every navigator in the chain during rating interaction', () => {
    const rootSetOptions = jest.fn();
    const rootCatalogSetOptions = jest.fn();
    const catalogStackSetOptions = jest.fn();
    const indexSetOptions = jest.fn();

    const rootStackNavigation = { setOptions: rootSetOptions };
    const rootCatalogNavigation = {
      setOptions: rootCatalogSetOptions,
      getParent: () => rootStackNavigation,
    };
    const catalogStackNavigation = {
      setOptions: catalogStackSetOptions,
      getParent: () => rootCatalogNavigation,
    };
    const indexNavigation = {
      setOptions: indexSetOptions,
      getParent: () => catalogStackNavigation,
    };

    setCatalogDetailRatingGestureLock(indexNavigation, true);

    expect(indexSetOptions).toHaveBeenCalledWith(buildCatalogDetailGestureOptions(false));
    expect(catalogStackSetOptions).toHaveBeenCalledWith(
      buildCatalogDetailGestureOptions(false),
    );
    expect(rootCatalogSetOptions).toHaveBeenCalledWith(
      buildCatalogDetailGestureOptions(false),
    );
    expect(rootSetOptions).toHaveBeenCalledWith(buildCatalogDetailGestureOptions(false));
  });
});
