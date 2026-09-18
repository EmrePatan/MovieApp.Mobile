export interface CatalogDetailGestureOptions {
  gestureEnabled: boolean;
  fullScreenGestureEnabled: boolean;
}

interface GestureNavigationTarget {
  getParent?: () => GestureNavigationTarget | undefined;
  setOptions: (options: CatalogDetailGestureOptions) => void;
}

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

/**
 * After catalog detail moved to the root stack (ee2d5e7), the native interactive
 * pop back to the opening origin is owned by the root-stack `movie` / `tv`
 * screen. Walk the navigator chain so nested `[id]` layouts still reach it.
 */
export function resolveCatalogDetailGestureNavigation(
  navigation: GestureNavigationTarget,
): GestureNavigationTarget {
  const chain = walkNavigationChain(navigation);

  if (chain.length >= 2) {
    return chain[Math.max(1, chain.length - 2)];
  }

  return chain[0];
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

  resolveCatalogDetailGestureNavigation(navigation).setOptions(options);
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
