import type { ImperativeRouter } from 'expo-router';
import { logRouteNavigationOpen } from '@/debug/route-navigation-probe';

const DEFAULT_LIBRARY_RETURN_HREF = '/(tabs)/library';

let lastLibraryStackEntryReturnHref: string | null = null;

export function isLibraryStackRoute(segments: readonly string[]): boolean {
  const root = segments[0];
  return (
    root === 'upcoming'
    || root === 'following'
    || root === 'favorites'
    || root === 'discover-browse'
    || root === 'watch-history'
    || root === 'notifications'
    || root === 'watchlist'
  );
}

export function openLibraryStackScreen(
  router: ImperativeRouter,
  href: string,
  returnHref: string = DEFAULT_LIBRARY_RETURN_HREF,
): void {
  lastLibraryStackEntryReturnHref = returnHref;
  logRouteNavigationOpen('library-stack', {
    href,
    returnHref,
    api: 'router.push',
    withAnchor: false,
    navigator: 'root-stack',
  });
  router.push(href);
}

export function returnFromLibraryStackScreen(router: ImperativeRouter): void {
  const returnHref = lastLibraryStackEntryReturnHref ?? DEFAULT_LIBRARY_RETURN_HREF;
  lastLibraryStackEntryReturnHref = null;
  router.dismissTo(returnHref);
}

export function resetLibraryStackNavigationForTests(): void {
  lastLibraryStackEntryReturnHref = null;
}
