export const COLLAPSED_SEASON_PREVIEW_COUNT = 3;

export function shouldCollapseSeasonList(
  seasonCount: number,
  previewCount = COLLAPSED_SEASON_PREVIEW_COUNT,
): boolean {
  return seasonCount > previewCount;
}

export function getVisibleSeasons<T>(
  seasons: T[],
  expanded: boolean,
  previewCount = COLLAPSED_SEASON_PREVIEW_COUNT,
): T[] {
  if (expanded || seasons.length <= previewCount) {
    return seasons;
  }

  return seasons.slice(0, previewCount);
}
