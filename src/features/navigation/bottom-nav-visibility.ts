export type BottomNavVisibility = 'show' | 'hide';

export type BottomNavRouteCategory =
  | 'main-tab'
  | 'content-result'
  | 'detail'
  | 'auth'
  | 'profile-settings'
  | 'special-fullscreen';

const HIDDEN_BOTTOM_NAV_SEGMENTS = new Set([
  '(auth)',
  'profile',
]);

const HIDDEN_BOTTOM_NAV_ROUTE_NAMES = new Set([
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'check-email',
  'verify-email',
  'gallery',
]);

const MAIN_TAB_ROUTE_NAMES = new Set(['home', 'discover', 'library', 'insights']);

export function resolveBottomNavVisibility(segments: readonly string[]): BottomNavVisibility {
  const normalizedSegments = segments.filter((segment) => !segment.startsWith('(') || segment === '(auth)');

  if (segments.includes('(auth)')) {
    return 'hide';
  }

  if (segments.includes('profile')) {
    return 'hide';
  }

  const leafRoute = normalizedSegments.at(-1) ?? segments.at(-1);
  if (leafRoute && HIDDEN_BOTTOM_NAV_ROUTE_NAMES.has(leafRoute)) {
    return 'hide';
  }

  if (segments.includes('(tabs)')) {
    return 'show';
  }

  if (HIDDEN_BOTTOM_NAV_SEGMENTS.has(segments[0] ?? '')) {
    return 'hide';
  }

  return 'hide';
}

export function isMainTabRouteName(routeName: string): boolean {
  return MAIN_TAB_ROUTE_NAMES.has(routeName);
}

export function isPersistentBottomNavRoute(segments: readonly string[]): boolean {
  return resolveBottomNavVisibility(segments) === 'show';
}
