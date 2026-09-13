export const COLLAPSED_WATCHLIST_PREVIEW_COUNT = 2;

export interface WatchlistPickerPreviewItem {
  itemCount: number;
  name: string;
}

export function shouldCollapseWatchlistPicker(
  watchlistCount: number,
  previewCount = COLLAPSED_WATCHLIST_PREVIEW_COUNT,
): boolean {
  return watchlistCount > previewCount;
}

export function getVisibleWatchlists<T extends WatchlistPickerPreviewItem>(
  watchlists: T[],
  expanded: boolean,
  previewCount = COLLAPSED_WATCHLIST_PREVIEW_COUNT,
): T[] {
  if (expanded || watchlists.length <= previewCount) {
    return watchlists;
  }

  return [...watchlists]
    .sort((a, b) => {
      if (b.itemCount !== a.itemCount) {
        return b.itemCount - a.itemCount;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(0, previewCount);
}
