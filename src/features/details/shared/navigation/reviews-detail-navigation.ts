import type { ImperativeRouter } from 'expo-router';
import {
  buildCatalogDetailRoute,
  parseCatalogStackCatalogId,
} from '../routes';
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
  router.push(reviewsRoute, { withAnchor: true });
}

export function returnToCatalogDetailFromReviews(
  router: ImperativeRouter,
  contentType: 'movie' | 'tv',
  contentId: string,
): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.navigate(buildCatalogDetailRoute(contentId, contentType));
}

export function returnToCatalogDetailFromReviewsPathname(
  router: ImperativeRouter,
  pathname: string,
): void {
  const movieId = parseCatalogStackCatalogId(pathname, 'movie');
  if (movieId) {
    returnToCatalogDetailFromReviews(router, 'movie', movieId);
    return;
  }

  const tvId = parseCatalogStackCatalogId(pathname, 'tv');
  if (tvId) {
    returnToCatalogDetailFromReviews(router, 'tv', tvId);
    return;
  }

  router.back();
}
