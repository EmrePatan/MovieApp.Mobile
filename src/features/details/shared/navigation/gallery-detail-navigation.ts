import type { ImperativeRouter } from 'expo-router';
import { getMovieSegmentIndex, getPersonSegmentIndex, getTvSegmentIndex } from './catalog-route-segments';

export function isGalleryDetailRoute(segments: readonly string[]): boolean {
  const movieIndex = getMovieSegmentIndex(segments);
  if (movieIndex !== -1) {
    return segments[movieIndex + 2] === 'gallery';
  }

  const tvIndex = getTvSegmentIndex(segments);
  if (tvIndex !== -1) {
    return segments[tvIndex + 2] === 'gallery';
  }

  const personIndex = getPersonSegmentIndex(segments);
  if (personIndex !== -1) {
    return segments[personIndex + 2] === 'gallery';
  }

  return false;
}

export function openGalleryDetail(
  router: ImperativeRouter,
  galleryRoute: string,
): void {
  router.push(galleryRoute, { withAnchor: true });
}
