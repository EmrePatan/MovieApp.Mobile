import type { ImperativeRouter } from 'expo-router';
import { buildPersonDetailRoute } from '../routes';
import { getPersonSegmentIndex } from './catalog-route-segments';

export function isPersonDetailRoute(segments: readonly string[]): boolean {
  const personIndex = getPersonSegmentIndex(segments);
  if (personIndex === -1) {
    return false;
  }

  return segments.length === personIndex + 2;
}

export function openPersonDetail(
  router: ImperativeRouter,
  tmdbPersonId: number,
): void {
  router.push(buildPersonDetailRoute(tmdbPersonId));
}
