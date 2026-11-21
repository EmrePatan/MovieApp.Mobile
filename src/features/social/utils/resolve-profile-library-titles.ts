import type { SocialProfileShelfItem, SocialProfileStatistics } from '../types';

export function resolveProfileLibraryTitles(
  statistics: SocialProfileStatistics | null | undefined,
): SocialProfileShelfItem[] {
  if (!statistics) return [];

  const primary = statistics.libraryTitles;
  if (Array.isArray(primary) && primary.length > 0) {
    return primary;
  }

  const fallback = [...(statistics.favoriteMovies ?? []), ...(statistics.favoriteShows ?? [])];
  const seen = new Set<string>();
  const titles: SocialProfileShelfItem[] = [];
  for (const item of fallback) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    titles.push(item);
  }
  return titles;
}
