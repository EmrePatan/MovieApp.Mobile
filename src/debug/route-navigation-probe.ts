import { logNavigationDiagnostic } from './navigation-diagnostics';

export function logRouteNavigationOpen(
  kind: string,
  payload: Record<string, unknown>,
): void {
  if (!__DEV__) {
    return;
  }

  logNavigationDiagnostic(`nav-open:${kind}`, payload);
}
