import type { ComingUpTab } from '@/features/upcoming/navigation/coming-up-navigation';
import type { HomeComingUpSource } from '../types';

const KNOWN_COMING_UP_SOURCES = new Set<HomeComingUpSource>([
  'for-you',
  'upcoming',
  'personalized',
  'catalog',
]);

export function normalizeHomeComingUpSource(
  source: string | null | undefined,
  fallback: HomeComingUpSource,
): HomeComingUpSource {
  if (source && KNOWN_COMING_UP_SOURCES.has(source as HomeComingUpSource)) {
    return source as HomeComingUpSource;
  }

  return fallback;
}

/** Home Coming Up See All follows the rail source. Missing source stays on For You. */
export function resolveComingUpSeeAllTab(source?: HomeComingUpSource): ComingUpTab {
  if (source === 'upcoming' || source === 'catalog') {
    return 'upcoming';
  }

  return 'for-you';
}
