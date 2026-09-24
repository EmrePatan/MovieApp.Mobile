import {
  buildCatalogDetailGestureOptions,
  resolveCatalogDetailGestureNavigations,
  setCatalogDetailGestureEnabled,
  setCatalogDetailRatingGestureLock,
} from '@/features/details/shared/navigation/catalog-detail-gesture-navigation';

interface FakeNavigation {
  setOptions: jest.Mock;
  getParent?: () => FakeNavigation | undefined;
  getState: () => { routeNames: string[] };
}

function screenIn(routeNames: string[], parent?: FakeNavigation): FakeNavigation {
  return {
    setOptions: jest.fn(),
    getParent: parent ? () => parent : undefined,
    getState: () => ({ routeNames }),
  };
}

/** Root Stack > (tabs) Tabs > (app-shell) Stack > tv Stack > [id] Stack > child screen. */
function buildTvChildChain() {
  const tabsScreen = screenIn(['index', '(auth)', '(tabs)', 'profile']);
  const appShellScreen = screenIn(['(app-shell)', 'profile'], tabsScreen);
  const tvScreen = screenIn(['home', 'library', 'movie', 'tv', 'person'], appShellScreen);
  const detailEntryScreen = screenIn(['[id]'], tvScreen);
  const childScreen = screenIn(['index', 'reviews', 'credits', 'gallery'], detailEntryScreen);
  return { tabsScreen, appShellScreen, tvScreen, detailEntryScreen, childScreen };
}

describe('catalog detail gesture navigation', () => {
  it('guards the catalog detail entry and the tv screen from a child destination', () => {
    const { tabsScreen, appShellScreen, tvScreen, detailEntryScreen, childScreen } =
      buildTvChildChain();

    expect(resolveCatalogDetailGestureNavigations(childScreen)).toEqual([
      detailEntryScreen,
      tvScreen,
    ]);
    setCatalogDetailGestureEnabled(childScreen, false);

    const disabled = buildCatalogDetailGestureOptions(false);
    // The [id] entry pops back to a previous detail opened via recommendation.
    expect(detailEntryScreen.setOptions).toHaveBeenCalledWith(disabled);
    expect(tvScreen.setOptions).toHaveBeenCalledWith(disabled);
    expect(childScreen.setOptions).not.toHaveBeenCalled();
    expect(appShellScreen.setOptions).not.toHaveBeenCalled();
    expect(tabsScreen.setOptions).not.toHaveBeenCalled();
  });

  it('re-enables the same targets when the child destination loses focus', () => {
    const { tvScreen, detailEntryScreen, childScreen } = buildTvChildChain();

    setCatalogDetailGestureEnabled(childScreen, true);

    const enabled = buildCatalogDetailGestureOptions(true);
    expect(detailEntryScreen.setOptions).toHaveBeenCalledWith(enabled);
    expect(tvScreen.setOptions).toHaveBeenCalledWith(enabled);
  });

  it('targets the parent navigator when the catalog root cannot be identified', () => {
    const parentSetOptions = jest.fn();
    const childSetOptions = jest.fn();
    const parentNavigation = { setOptions: parentSetOptions };
    const navigation = {
      setOptions: childSetOptions,
      getParent: () => parentNavigation,
    };

    expect(resolveCatalogDetailGestureNavigations(navigation)).toEqual([parentNavigation]);
    setCatalogDetailGestureEnabled(navigation, false);

    expect(parentSetOptions).toHaveBeenCalledWith(
      buildCatalogDetailGestureOptions(false),
    );
    expect(childSetOptions).not.toHaveBeenCalled();
  });

  it('falls back to the current navigator when no parent exists', () => {
    const setOptions = jest.fn();
    const navigation = { setOptions };

    expect(resolveCatalogDetailGestureNavigations(navigation)).toEqual([navigation]);
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
