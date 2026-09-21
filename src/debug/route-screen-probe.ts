import { useCallback } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useFocusEffect, usePathname, useSegments } from 'expo-router';
import { logNavigationDiagnostic } from './navigation-diagnostics';

export function useRouteScreenProbe(scope: string, extra: Record<string, unknown> = {}): {
  pathname: string;
  segments: string[];
  onRootLayout: (event: LayoutChangeEvent) => void;
} {
  const pathname = usePathname();
  const segments = useSegments();

  useFocusEffect(
    useCallback(() => {
      logNavigationDiagnostic(`route-probe:${scope}:focus`, {
        pathname,
        segments,
        ...extra,
      });

      return () => {
        logNavigationDiagnostic(`route-probe:${scope}:blur`, {
          pathname,
          segments,
        });
      };
    }, [extra, pathname, scope, segments]),
  );

  const onRootLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      logNavigationDiagnostic(`route-probe:${scope}:root-layout`, {
        pathname,
        segments,
        x,
        y,
        width,
        height,
        ...extra,
      });
    },
    [extra, pathname, scope, segments],
  );

  return { pathname, segments, onRootLayout };
}

export function logRouteScreenMount(scope: string, payload: Record<string, unknown> = {}): void {
  if (!__DEV__) {
    return;
  }

  logNavigationDiagnostic(`route-probe:${scope}:mount`, payload);
}
