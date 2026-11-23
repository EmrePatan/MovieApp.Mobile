import type { SocialProfileShelfItem, SocialProfileStatistics } from '../types';

function collectWatched(statistics: SocialProfileStatistics | null | undefined) {
  const byId = new Map<string, SocialProfileShelfItem>();
  if (!statistics) {
    return byId;
  }
  for (const list of [statistics.watchedTitles, statistics.libraryTitles]) {
    for (const item of list ?? []) {
      if (item?.id && !byId.has(item.id)) {
        byId.set(item.id, item);
      }
    }
  }
  return byId;
}

/** Titles both people have watched, in the other person's order. */
export function findCommonWatchedTitles(
  mine: SocialProfileStatistics | null | undefined,
  theirs: SocialProfileStatistics | null | undefined,
): SocialProfileShelfItem[] {
  const myTitles = collectWatched(mine);
  if (myTitles.size === 0) {
    return [];
  }
  return [...collectWatched(theirs).values()].filter((item) => myTitles.has(item.id));
}
