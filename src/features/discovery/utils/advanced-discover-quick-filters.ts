import type { AdvancedDiscoverFilters } from '../advanced-discover-types';

export type AdvancedDiscoverQuickFilterKey =
  | 'underTwoHours'
  | 'runtime90to120'
  | 'rating7Plus'
  | 'year2015Plus'
  | 'streaming';

export function isQuickFilterActive(
  key: AdvancedDiscoverQuickFilterKey,
  filters: AdvancedDiscoverFilters,
): boolean {
  switch (key) {
    case 'underTwoHours':
      return filters.maxRuntimeMinutes === 119 && filters.minRuntimeMinutes == null;
    case 'runtime90to120':
      return filters.minRuntimeMinutes === 90 && filters.maxRuntimeMinutes === 120;
    case 'rating7Plus':
      return filters.minRating === 7 && filters.maxRating == null;
    case 'year2015Plus':
      return filters.yearFrom === 2015 && filters.year == null && filters.yearTo == null;
    case 'streaming':
      return filters.watchMonetizationTypes.includes('stream');
    default:
      return false;
  }
}

export function toggleQuickFilter(
  key: AdvancedDiscoverQuickFilterKey,
  filters: AdvancedDiscoverFilters,
  userRegion: string,
): AdvancedDiscoverFilters {
  if (isQuickFilterActive(key, filters)) {
    return clearQuickFilter(key, filters);
  }

  switch (key) {
    case 'underTwoHours':
      return {
        ...filters,
        minRuntimeMinutes: null,
        maxRuntimeMinutes: 119,
      };
    case 'runtime90to120':
      return {
        ...filters,
        minRuntimeMinutes: 90,
        maxRuntimeMinutes: 120,
      };
    case 'rating7Plus':
      return {
        ...filters,
        minRating: 7,
        maxRating: null,
      };
    case 'year2015Plus':
      return {
        ...filters,
        year: null,
        yearFrom: 2015,
        yearTo: null,
      };
    case 'streaming':
      return {
        ...filters,
        watchMonetizationTypes: ['stream'],
        watchRegion: filters.watchRegion ?? userRegion,
      };
    default:
      return filters;
  }
}

function clearQuickFilter(
  key: AdvancedDiscoverQuickFilterKey,
  filters: AdvancedDiscoverFilters,
): AdvancedDiscoverFilters {
  switch (key) {
    case 'underTwoHours':
      return filters.maxRuntimeMinutes === 119 && filters.minRuntimeMinutes == null
        ? { ...filters, maxRuntimeMinutes: null }
        : filters;
    case 'runtime90to120':
      return filters.minRuntimeMinutes === 90 && filters.maxRuntimeMinutes === 120
        ? { ...filters, minRuntimeMinutes: null, maxRuntimeMinutes: null }
        : filters;
    case 'rating7Plus':
      return filters.minRating === 7
        ? { ...filters, minRating: null }
        : filters;
    case 'year2015Plus':
      return filters.yearFrom === 2015
        ? { ...filters, yearFrom: null }
        : filters;
    case 'streaming':
      return filters.watchMonetizationTypes.includes('stream')
        ? {
            ...filters,
            watchMonetizationTypes: filters.watchMonetizationTypes.filter((entry) => entry !== 'stream'),
          }
        : filters;
    default:
      return filters;
  }
}
