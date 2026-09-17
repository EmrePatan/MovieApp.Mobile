import type { ImperativeRouter } from 'expo-router';
import { isCatalogChildDestinationSegment } from '../routes';
import { getMovieSegmentIndex, getTvSegmentIndex } from './catalog-route-segments';

export function isReviewsDetailRoute(segments: readonly string[]): boolean {
  const movieIndex = getMovieSegmentIndex(segments);
  if (movieIndex !== -1) {
    return segments[movieIndex + 2] === 'reviews';
  }

  const tvIndex = getTvSegmentIndex(segments);
  if (tvIndex !== -1) {
    return segments[tvIndex + 2] === 'reviews';
  }

  return false;
}

export function openReviewsDetail(
  router: ImperativeRouter,
  reviewsRoute: string,
): void {
  router.push(reviewsRoute);
}
