import type { ImperativeRouter } from 'expo-router';
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
  router.push(creditsRoute);
}
