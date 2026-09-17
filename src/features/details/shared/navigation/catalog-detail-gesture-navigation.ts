interface GestureNavigationTarget {
  getParent?: () => GestureNavigationTarget | undefined;
  setOptions: (options: { gestureEnabled: boolean }) => void;
}

/**
 * After catalog detail moved to the root stack (ee2d5e7), the native interactive
 * pop back to the opening origin is owned by the parent root-stack screen (`movie`
 * or `tv`), not the nested catalog index screen.
 */
export function resolveCatalogDetailGestureNavigation(
  navigation: GestureNavigationTarget,
): GestureNavigationTarget {
  return navigation.getParent?.() ?? navigation;
}

export function setCatalogDetailGestureEnabled(
  navigation: GestureNavigationTarget,
  gestureEnabled: boolean,
): void {
  resolveCatalogDetailGestureNavigation(navigation).setOptions({ gestureEnabled });
}
