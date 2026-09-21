import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/** Bump when #45 diagnostics/fixes change so Metro logs prove the active bundle. */
export const NAV_DIAGNOSTIC_BUILD_ID = 'MA-45-2026-09-21-v12';

const PREFIX = `[NAV_DIAG:${NAV_DIAGNOSTIC_BUILD_ID}]`;

let screenInstanceCounter = 0;

export function logNavigationDiagnostic(
  scope: string,
  payload: Record<string, unknown>,
): void {
  if (!__DEV__) {
    return;
  }

  console.log(`${PREFIX} ${scope}`, payload);
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

/** Per-render trace with route + platform context. */
export function useScreenRenderTrace(
  screen: string,
  payload: Record<string, unknown>,
): void {
  const instanceIdRef = useRef<string | null>(null);

  if (instanceIdRef.current === null) {
    screenInstanceCounter += 1;
    instanceIdRef.current = `${screen}-${screenInstanceCounter}`;
  }

  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  if (__DEV__) {
    logNavigationDiagnostic(`trace:${screen}`, {
      platform: Platform.OS,
      instanceId: instanceIdRef.current,
      renderCount: renderCountRef.current,
      ...payload,
    });
  }
}
