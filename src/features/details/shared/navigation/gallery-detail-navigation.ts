import type { ImperativeRouter } from 'expo-router';

let lastGalleryReturnHref: string | null = null;

export function isGalleryDetailRoute(segments: readonly string[]): boolean {
  const tabsIndex = segments.indexOf('(tabs)');
  if (tabsIndex === -1) {
    return false;
  }

  return segments[tabsIndex + 1] === 'gallery';
}

export function openGalleryDetail(
  router: ImperativeRouter,
  galleryRoute: string,
  returnHref: string,
): void {
  lastGalleryReturnHref = returnHref;
  router.push(galleryRoute);
}

export function returnFromGalleryDetail(router: ImperativeRouter): void {
  const returnHref = lastGalleryReturnHref;
  lastGalleryReturnHref = null;

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

export function resetGalleryDetailNavigationForTests(): void {
  lastGalleryReturnHref = null;
}
