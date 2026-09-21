import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';

/** Bump when #45 diagnostics/fixes change so Metro logs prove the active bundle. */
export const NAV_DIAGNOSTIC_BUILD_ID = 'MA-45-2026-09-21-v5';

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

function createScreenInstanceId(screen: string): string {
  screenInstanceCounter += 1;
  return `${screen}-${screenInstanceCounter}`;
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

/**
 * Per-render trace with route + platform context.
 * Prefer this over FlatList onLayout, which is unreliable even when lists paint (iOS).
 */
export function useScreenRenderTrace(
  screen: string,
  payload: Record<string, unknown>,
): string {
  const instanceIdRef = useRef<string | null>(null);

  if (instanceIdRef.current === null) {
    instanceIdRef.current = createScreenInstanceId(screen);
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

  return instanceIdRef.current;
}

export interface RouteLifecycleContext {
  pathname: string;
  segments: readonly string[];
  instanceId: string;
}

/**
 * Mount/unmount/focus/AppState tracing for a single screen instance.
 */
export function useRouteLifecycleDiagnostics(
  screen: string,
  context: RouteLifecycleContext,
): void {
  const { pathname, segments, instanceId } = context;
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    logNavigationDiagnostic(`lifecycle:${screen}:mount`, {
      platform: Platform.OS,
      instanceId,
      pathname,
      segments,
      appState: appStateRef.current,
    });

    return () => {
      logNavigationDiagnostic(`lifecycle:${screen}:unmount`, {
        platform: Platform.OS,
        instanceId,
        pathname,
        segments,
        appState: appStateRef.current,
      });
    };
  }, [instanceId, pathname, screen, segments]);

  useFocusEffect(
    useCallback(() => {
      logNavigationDiagnostic(`lifecycle:${screen}:focus`, {
        platform: Platform.OS,
        instanceId,
        pathname,
        segments,
        isFocused: true,
        appState: appStateRef.current,
      });

      return () => {
        logNavigationDiagnostic(`lifecycle:${screen}:blur`, {
          platform: Platform.OS,
          instanceId,
          pathname,
          segments,
          isFocused: false,
          appState: appStateRef.current,
        });
      };
    }, [instanceId, pathname, screen, segments]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      logNavigationDiagnostic(`lifecycle:${screen}:app-state`, {
        platform: Platform.OS,
        instanceId,
        pathname,
        segments,
        from: appStateRef.current,
        to: nextState,
      });
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [instanceId, pathname, screen, segments]);
}
