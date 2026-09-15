import type { ImperativeRouter } from 'expo-router';

const DEFAULT_LIBRARY_RETURN_HREF = '/(tabs)/home';

let lastLibraryStackEntryReturnHref: string | null = null;

export function isLibraryStackRoute(segments: readonly string[]): boolean {
  const root = segments[0];
  return (
    root === 'upcoming'
    || root === 'following'
    || root === 'favorites'
    || root === 'discover'
    || root === 'watch-history'
    || root === 'notifications'
  );
}

export function openLibraryStackScreen(
  router: ImperativeRouter,
  href: string,
  returnHref: string = DEFAULT_LIBRARY_RETURN_HREF,
): void {
  lastLibraryStackEntryReturnHref = returnHref;
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
