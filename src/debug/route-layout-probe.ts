import { useMemo } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { usePathname, useSegments } from 'expo-router';
import { describeViewStyle, logStackLayout } from './stack-layout-probe';
import { logNavigationDiagnostic } from './navigation-diagnostics';

export interface RouteLayoutContext {
  pathname: string;
  segments: string[];
}

export function useRouteLayoutContext(): RouteLayoutContext {
  const pathname = usePathname();
  const segments = useSegments();

  return useMemo(
    () => ({
      pathname,
      segments: [...segments],
    }),
    [pathname, segments],
  );
}

export function logRouteLayout(
  layoutScope: string,
  probe: string,
  event: LayoutChangeEvent,
  route: RouteLayoutContext,
  extra: Record<string, unknown> = {},
): void {
  logStackLayout(`layout:${layoutScope}:${probe}`, event, {
    pathname: route.pathname,
    segments: route.segments,
    ...extra,
  });
}

export function logRouteLayoutMeta(
  layoutScope: string,
  route: RouteLayoutContext,
  payload: Record<string, unknown>,
): void {
  if (!__DEV__) {
    return;
  }

  logNavigationDiagnostic(`layout:${layoutScope}:meta`, {
    pathname: route.pathname,
    segments: route.segments,
    ...payload,
  });
}

export function routeLayoutHandler(
  layoutScope: string,
  probe: string,
  route: RouteLayoutContext,
  extra?: Record<string, unknown>,
) {
  return (event: LayoutChangeEvent) => {
    logRouteLayout(layoutScope, probe, event, route, extra);
  };
}

export function describeLayoutStyles(
  styles: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(styles).map(([key, value]) => [key, describeViewStyle(value as never)]),
  );
}
