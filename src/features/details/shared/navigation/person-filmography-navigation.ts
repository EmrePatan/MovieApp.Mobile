import type { ImperativeRouter } from 'expo-router';
import { getPersonSegmentIndex } from './catalog-route-segments';

export function isPersonFilmographyRoute(segments: readonly string[]): boolean {
  const personIndex = getPersonSegmentIndex(segments);
  if (personIndex === -1) {
    return false;
  }

  return segments[personIndex + 2] === 'filmography';
}

export function openPersonFilmography(
  router: ImperativeRouter,
  filmographyRoute: string,
): void {
  router.push(filmographyRoute);
}
