export interface CatalogDetailGestureOptions {
  gestureEnabled: boolean;
  fullScreenGestureEnabled: boolean;
}

interface GestureNavigationTarget {
  getParent?: () => GestureNavigationTarget | undefined;
  getState?: () => { routeNames?: readonly string[] } | undefined;
  setOptions: (options: CatalogDetailGestureOptions) => void;
}

const CATALOG_ROOT_ROUTE_NAMES = ['movie', 'tv'];

export function buildCatalogDetailGestureOptions(
  gestureEnabled: boolean,
): CatalogDetailGestureOptions {
  return {
    gestureEnabled,
    fullScreenGestureEnabled: false,
  };
}

function walkNavigationChain(navigation: GestureNavigationTarget): GestureNavigationTarget[] {
  const chain: GestureNavigationTarget[] = [navigation];
  let current = navigation;

  while (current.getParent?.()) {
    current = current.getParent()!;
    chain.push(current);
  }

  return chain;
}

function isCatalogRootScreen(navigation: GestureNavigationTarget): boolean {
  const routeNames = navigation.getState?.()?.routeNames ?? [];
  return CATALOG_ROOT_ROUTE_NAMES.some((name) => routeNames.includes(name));
}

/**
 * Ancestors whose interactive pop would leave the current catalog detail: the
 * `[id]` entry inside the `movie` / `tv` stack (which returns to a previously
 * opened detail, e.g. after a recommendation) up to the `movie` / `tv` screen in
 * the stack that declares them. Resolved by route names so layout nesting
 * changes do not shift the target.
 */
export function resolveCatalogDetailGestureNavigations(
  navigation: GestureNavigationTarget,
): GestureNavigationTarget[] {
  const chain = walkNavigationChain(navigation);
  const catalogRootIndex = chain.findIndex(isCatalogRootScreen);

  if (catalogRootIndex >= 1) {
    return chain.slice(1, catalogRootIndex + 1);
  }

  return [chain[1] ?? chain[0]];
}

function applyCatalogDetailGestureOptions(
  navigation: GestureNavigationTarget,
  options: CatalogDetailGestureOptions,
  scope: 'target' | 'chain',
): void {
  if (scope === 'chain') {
    for (const target of walkNavigationChain(navigation)) {
      target.setOptions(options);
    }
    return;
  }

  for (const target of resolveCatalogDetailGestureNavigations(navigation)) {
    target.setOptions(options);
  }
}

export function setCatalogDetailGestureEnabled(
  navigation: GestureNavigationTarget,
  gestureEnabled: boolean,
): void {
  applyCatalogDetailGestureOptions(
    navigation,
    buildCatalogDetailGestureOptions(gestureEnabled),
    'target',
  );
}

/**
 * Disables every navigator in the catalog chain while the inline rating control
 * is active so horizontal star drags cannot trigger a root interactive pop.
 */
export function setCatalogDetailRatingGestureLock(
  navigation: GestureNavigationTarget,
  locked: boolean,
): void {
  applyCatalogDetailGestureOptions(
    navigation,
    buildCatalogDetailGestureOptions(!locked),
    'chain',
  );
}
