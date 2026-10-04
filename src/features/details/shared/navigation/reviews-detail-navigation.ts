import type { Href, ImperativeRouter } from 'expo-router';
import {
  buildCatalogDetailRoute,
  parseCatalogStackCatalogId,
} from '../routes';
import { getMovieSegmentIndex, getTvSegmentIndex } from './catalog-route-segments';

export const MY_COMMENTS_REVIEWS_RETURN_HREF = '/profile/my-comments' as const;

let reviewsReturnHref: string | null = null;

export function peekReviewsReturnHref(): string | null {
  return reviewsReturnHref;
}

export function resetReviewsNavigationForTests(): void {
  reviewsReturnHref = null;
}

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
  options?: { returnHref?: string },
): void {
  if (options?.returnHref) {
    reviewsReturnHref = options.returnHref;
    router.push(reviewsRoute);
    return;
  }

  reviewsReturnHref = null;
  router.push(reviewsRoute, { withAnchor: true });
}

export function returnFromReviewsScreen(router: ImperativeRouter): boolean {
  const returnHref = reviewsReturnHref;
  if (!returnHref) {
    return false;
  }

  reviewsReturnHref = null;
  router.dismissTo(returnHref as Href);
  return true;
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

export function openCatalogDetailFromReviews(
  router: ImperativeRouter,
  contentType: 'movie' | 'tv',
  contentId: string,
): void {
  if (peekReviewsReturnHref()) {
    router.push(buildCatalogDetailRoute(contentId, contentType));
    return;
  }

  returnToCatalogDetailFromReviews(router, contentType, contentId);
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
