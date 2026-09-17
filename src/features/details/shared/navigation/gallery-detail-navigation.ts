import type { ImperativeRouter } from 'expo-router';
import { isCatalogChildDestinationSegment } from '../routes';

export function isGalleryDetailRoute(segments: readonly string[]): boolean {
  const tabsIndex = segments.indexOf('(tabs)');
  if (tabsIndex === -1) {
    return false;
  }

  const section = segments[tabsIndex + 1];
  if (section === 'movie' || section === 'tv') {
    return isCatalogChildDestinationSegment(segments[tabsIndex + 3]) &&
      segments[tabsIndex + 3] === 'gallery';
  }

  if (section === 'person') {
    return segments[tabsIndex + 3] === 'gallery';
  }

  return false;
}

export function openGalleryDetail(
  router: ImperativeRouter,
  galleryRoute: string,
): void {
  router.push(galleryRoute);
}
