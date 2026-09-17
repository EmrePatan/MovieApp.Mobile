import type { ImperativeRouter } from 'expo-router';

let lastReviewsReturnHref: string | null = null;

export function isReviewsDetailRoute(segments: readonly string[]): boolean {
  const tabsIndex = segments.indexOf('(tabs)');
  if (tabsIndex === -1) {
    return false;
  }

  return segments[tabsIndex + 1] === 'reviews';
}

export function openReviewsDetail(
  router: ImperativeRouter,
  reviewsRoute: string,
  returnHref: string,
): void {
  lastReviewsReturnHref = returnHref;
  router.push(reviewsRoute);
}

export function returnFromReviewsDetail(router: ImperativeRouter): void {
  const returnHref = lastReviewsReturnHref;
  lastReviewsReturnHref = null;

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

export function resetReviewsDetailNavigationForTests(): void {
  lastReviewsReturnHref = null;
}
