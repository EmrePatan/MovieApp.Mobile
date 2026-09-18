interface GestureNavigationTarget {
  getParent?: () => GestureNavigationTarget | undefined;
  setOptions: (options: { gestureEnabled: boolean }) => void;
}

/**
 * After catalog detail moved to the root stack (ee2d5e7), the native interactive
 * pop back to the opening origin is owned by the root-stack `movie` / `tv`
 * screen. Walk the navigator chain so nested `[id]` layouts still reach it.
 */
export function resolveCatalogDetailGestureNavigation(
  navigation: GestureNavigationTarget,
): GestureNavigationTarget {
  const chain: GestureNavigationTarget[] = [navigation];
  let current = navigation;

  while (current.getParent?.()) {
    current = current.getParent()!;
    chain.push(current);
  }

  if (chain.length === 1) {
    return chain[0];
  }

  const rootCatalogIndex = Math.max(1, chain.length - 2);
  return chain[rootCatalogIndex];
}

export function setCatalogDetailGestureEnabled(
  navigation: GestureNavigationTarget,
  gestureEnabled: boolean,
): void {
  resolveCatalogDetailGestureNavigation(navigation).setOptions({ gestureEnabled });
}
