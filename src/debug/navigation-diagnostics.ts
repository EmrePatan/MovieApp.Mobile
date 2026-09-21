import { useEffect } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/** Bump when #45 diagnostics/fixes change so Metro logs prove the active bundle. */
export const NAV_DIAGNOSTIC_BUILD_ID = 'MA-45-2026-09-21-v2';

const PREFIX = `[NAV_DIAG:${NAV_DIAGNOSTIC_BUILD_ID}]`;

export function logNavigationDiagnostic(
  scope: string,
  payload: Record<string, unknown>,
): void {
  if (!__DEV__) {
    return;
  }

  console.log(`${PREFIX} ${scope}`, payload);
}

export function createLayoutDiagnosticHandler(
  scope: string,
): (event: LayoutChangeEvent) => void {
  return (event) => {
    if (!__DEV__) {
      return;
    }

    const { width, height, x, y } = event.nativeEvent.layout;
    console.log(`${PREFIX} layout:${scope}`, { width, height, x, y });
  };
}

export function useNavigationDiagnostics(
  screen: string,
  payload: Record<string, unknown>,
): void {
  const payloadKey = JSON.stringify(payload);

  useEffect(() => {
    logNavigationDiagnostic(`state:${screen}`, payload);
  }, [payloadKey, screen]);
}
