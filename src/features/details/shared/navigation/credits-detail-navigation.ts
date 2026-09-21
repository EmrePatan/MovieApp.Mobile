import type { ImperativeRouter } from 'expo-router';
import { logRouteNavigationOpen } from '@/debug/route-navigation-probe';
import { getMovieSegmentIndex, getTvSegmentIndex } from './catalog-route-segments';

export function isCreditsDetailRoute(segments: readonly string[]): boolean {
  const movieIndex = getMovieSegmentIndex(segments);
  if (movieIndex !== -1) {
    return segments[movieIndex + 2] === 'credits';
  }

  const tvIndex = getTvSegmentIndex(segments);
  if (tvIndex !== -1) {
    return segments[tvIndex + 2] === 'credits';
  }

  return false;
}

export function openCreditsDetail(
  router: ImperativeRouter,
  creditsRoute: string,
): void {
  logRouteNavigationOpen('cast-see-all', {
    href: creditsRoute,
    api: 'router.push',
    withAnchor: true,
    navigator: 'nested-detail-child-stack',
  });
  router.push(creditsRoute, { withAnchor: true });
}
