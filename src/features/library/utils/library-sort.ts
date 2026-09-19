import { translateLibrarySort } from '@/i18n/catalog-labels';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';
import type { LibrarySortOption } from '../types';

function compareTitle(left: LibraryItem, right: LibraryItem): number {
  return left.title.localeCompare(right.title, undefined, { sensitivity: 'base' });
}

export function sortLibraryItems(
  items: LibraryItem[],
  sort: LibrarySortOption,
): LibraryItem[] {
  const sorted = [...items];

  switch (sort) {
    case 'recentlyAdded':
      return sorted.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
    case 'titleAsc':
      return sorted.sort(compareTitle);
    case 'ratingDesc':
      return sorted.sort((left, right) => {
        const ratingDiff = right.voteAverage - left.voteAverage;
        return ratingDiff !== 0 ? ratingDiff : compareTitle(left, right);
      });
    default:
      return sorted;
  }
}

export function getAvailableSortOptions(
  supportsRecentlyAdded: boolean,
): LibrarySortOption[] {
  const options: LibrarySortOption[] = [];

  if (supportsRecentlyAdded) {
    options.push('recentlyAdded');
  }

  options.push('titleAsc', 'ratingDesc');
  return options;
}

export function getSortLabel(sort: LibrarySortOption): string {
  return translateLibrarySort(sort);
}
