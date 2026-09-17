import type { ImperativeRouter } from 'expo-router';
import { isCatalogChildDestinationSegment } from '../routes';

export function isCreditsDetailRoute(segments: readonly string[]): boolean {
  const tabsIndex = segments.indexOf('(tabs)');
  if (tabsIndex === -1) {
    return false;
  }

  const section = segments[tabsIndex + 1];
  if (section !== 'movie' && section !== 'tv') {
    return false;
  }

  return isCatalogChildDestinationSegment(segments[tabsIndex + 3]) &&
    segments[tabsIndex + 3] === 'credits';
}

export function openCreditsDetail(
  router: ImperativeRouter,
  creditsRoute: string,
): void {
  router.push(creditsRoute);
}
