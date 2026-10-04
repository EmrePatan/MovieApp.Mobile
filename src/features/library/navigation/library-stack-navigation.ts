import type { ImperativeRouter } from 'expo-router';
import {
  clearAppShellTabOrigin,
  getAppShellTabOriginForTests,
  rememberAppShellTabOrigin,
} from '@/features/navigation/app-shell-tab-origin';

const DEFAULT_LIBRARY_RETURN_HREF = '/(tabs)/library';

let lastLibraryStackEntryReturnHref: string | null = null;

export function isLibraryStackRoute(segments: readonly string[]): boolean {
  const root = segments[0];
  return (
    root === 'upcoming'
    || root === 'following'
    || root === 'favorites'
    || root === 'discover-browse'
    || root === 'streaming-discover'
    || root === 'streaming-platforms'
    || root === 'discover-genres'
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
  rememberAppShellTabOrigin(returnHref);
  router.push(href);
}

export function returnFromLibraryStackScreen(router: ImperativeRouter): void {
  const returnHref = lastLibraryStackEntryReturnHref ?? DEFAULT_LIBRARY_RETURN_HREF;
  clearLibraryStackNavigationContext();
  router.dismissTo(returnHref);
}

export function clearLibraryStackNavigationContext(): void {
  lastLibraryStackEntryReturnHref = null;
  clearAppShellTabOrigin();
}

export function resetLibraryStackNavigationForTests(): void {
  clearLibraryStackNavigationContext();
}

export function getLibraryStackNavigationContextForTests(): {
  returnHref: string | null;
  primaryTab: ReturnType<typeof getAppShellTabOriginForTests>;
} {
  return {
    returnHref: lastLibraryStackEntryReturnHref,
    primaryTab: getAppShellTabOriginForTests(),
  };
}
