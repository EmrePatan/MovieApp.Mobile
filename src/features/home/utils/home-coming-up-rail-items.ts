import type { HomeItem } from '../types';

/** Visible cards in the home Coming Up horizontal rail. */
export const HOME_COMING_UP_RAIL_SIZE = 10;

/** Catalog fetch size; extra rows cover titles dropped when poster art is missing. */
export const HOME_COMING_UP_CATALOG_FETCH_SIZE = 40;

export function hasHomeComingUpPoster(item: HomeItem): boolean {
  return Boolean(item.posterUrl?.trim());
}

export function selectHomeComingUpRailItems(
  items: readonly HomeItem[],
  limit = HOME_COMING_UP_RAIL_SIZE,
): HomeItem[] {
  const selected: HomeItem[] = [];

  for (const item of items) {
    if (!hasHomeComingUpPoster(item)) {
      continue;
    }

    selected.push(item);
    if (selected.length >= limit) {
      break;
    }
  }

  return selected;
}
