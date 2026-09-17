import type { ImperativeRouter } from 'expo-router';
import { returnToDetailChildOrigin } from './detail-child-destination-navigation';

let lastCreditsReturnHref: string | null = null;

export function isCreditsDetailRoute(segments: readonly string[]): boolean {
  const tabsIndex = segments.indexOf('(tabs)');
  if (tabsIndex === -1) {
    return false;
  }

  return segments[tabsIndex + 1] === 'credits';
}

export function openCreditsDetail(
  router: ImperativeRouter,
  creditsRoute: string,
  returnHref: string,
): void {
  lastCreditsReturnHref = returnHref;
  router.push(creditsRoute);
}

export function returnFromCreditsDetail(router: ImperativeRouter): void {
  const returnHref = lastCreditsReturnHref;
  lastCreditsReturnHref = null;
  returnToDetailChildOrigin(router, returnHref);
}

export function resetCreditsDetailNavigationForTests(): void {
  lastCreditsReturnHref = null;
}
