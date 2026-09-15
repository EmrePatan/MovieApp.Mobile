import type { ImperativeRouter } from 'expo-router';
import { buildPersonDetailRoute } from '../routes';

let lastPersonDetailReturnHref: string | null = null;

export function isPersonDetailRoute(segments: readonly string[]): boolean {
  const tabsIndex = segments.indexOf('(tabs)');
  if (tabsIndex === -1) {
    return false;
  }

  if (segments[tabsIndex + 1] !== 'person') {
    return false;
  }

  return segments.length === tabsIndex + 3;
}

export function openPersonDetail(
  router: ImperativeRouter,
  tmdbPersonId: number,
  returnHref: string,
): void {
  lastPersonDetailReturnHref = returnHref;
  router.push(buildPersonDetailRoute(tmdbPersonId));
}

export function returnFromPersonDetail(router: ImperativeRouter): void {
  const returnHref = lastPersonDetailReturnHref;
  lastPersonDetailReturnHref = null;

  if (returnHref) {
    router.navigate(returnHref);
    return;
  }

  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.navigate('/(tabs)/home');
}

export function resetPersonDetailNavigationForTests(): void {
  lastPersonDetailReturnHref = null;
}
