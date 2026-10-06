import type { AdvancedDiscoverMediaType, AdvancedDiscoverRequest } from '../advanced-discover-types';
import type { WorldCinemaRequest } from '../world-cinema-types';
import type { DiscoveryBrowseRequest } from '../types';
import type { DiscoveryKeywordsRequest } from '../keyword-types';
import { DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE } from '../advanced-discover-types';
import { DEFAULT_DISCOVERY_PAGE_SIZE } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '@/features/home/types';

export function buildGenresPath(): string {
  return '/api/genres';
}

export function buildDiscoveryWatchProvidersPath(
  mediaType: AdvancedDiscoverMediaType,
  watchRegion: string,
): string {
  const params = new URLSearchParams({
    mediaType,
    watchRegion,
  });

  return `/api/discovery/watch-providers?${params.toString()}`;
}

export function buildDiscoveryKeywordsPath(criteria: DiscoveryKeywordsRequest): string {
  const params = new URLSearchParams({
    query: criteria.query,
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? 20),
  });

  return `/api/discovery/keywords?${params.toString()}`;
}

function appendSharedDiscoverFilters(
  params: URLSearchParams,
  criteria: {
    genreIds?: string[];
    genreMatch?: string;
    year?: number | null;
    yearFrom?: number | null;
    yearTo?: number | null;
    minRating?: number | null;
    maxRating?: number | null;
    minVoteCount?: number | null;
    minRuntimeMinutes?: number | null;
    maxRuntimeMinutes?: number | null;
    originalLanguage?: string | null;
    language?: string | null;
    originCountry?: string | null;
    keywordIds?: string[];
    tvStatuses?: string[];
    sort?: string | null;
  },
  options?: { languageParamName?: 'language' | 'originalLanguage' },
): void {
  for (const genreId of criteria.genreIds ?? []) {
    params.append('genreId', genreId);
  }

  if (
    (criteria.genreIds?.length ?? 0) > 1 &&
    criteria.genreMatch === 'any'
  ) {
    params.set('genreMatch', 'any');
  }

  if (criteria.year != null) {
    params.set('year', String(criteria.year));
  }

  if (criteria.yearFrom != null) {
    params.set('yearFrom', String(criteria.yearFrom));
  }

  if (criteria.yearTo != null) {
    params.set('yearTo', String(criteria.yearTo));
  }

  if (criteria.minRating != null) {
    params.set('minRating', String(criteria.minRating));
  }

  if (criteria.maxRating != null) {
    params.set('maxRating', String(criteria.maxRating));
  }

  if (criteria.minVoteCount != null) {
    params.set('minVoteCount', String(criteria.minVoteCount));
  }

  if (criteria.minRuntimeMinutes != null) {
    params.set('minRuntimeMinutes', String(criteria.minRuntimeMinutes));
  }

  if (criteria.maxRuntimeMinutes != null) {
    params.set('maxRuntimeMinutes', String(criteria.maxRuntimeMinutes));
  }

  const languageParamName = options?.languageParamName ?? 'originalLanguage';
  const languageValue =
    languageParamName === 'language' ? criteria.language : criteria.originalLanguage;
  if (languageValue) {
    params.set(languageParamName, languageValue);
  }

  if (criteria.originCountry) {
    params.set('originCountry', criteria.originCountry);
  }

  for (const keywordId of criteria.keywordIds ?? []) {
    params.append('keywordId', keywordId);
  }

  for (const tvStatus of criteria.tvStatuses ?? []) {
    params.append('tvStatus', tvStatus);
  }

  if (criteria.sort) {
    params.set('sort', criteria.sort);
  }
}

export function buildWorldCinemaPath(criteria: WorldCinemaRequest): string {
  const params = new URLSearchParams({
    mediaType: criteria.mediaType,
    originCountry: criteria.originCountry,
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? 20),
  });

  appendSharedDiscoverFilters(params, {
    genreIds: criteria.genreIds,
    genreMatch: criteria.genreMatch,
    year: criteria.year,
    yearFrom: criteria.yearFrom,
    yearTo: criteria.yearTo,
    minRating: criteria.minRating,
    maxRating: criteria.maxRating,
    minVoteCount: criteria.minVoteCount,
    minRuntimeMinutes: criteria.minRuntimeMinutes,
    maxRuntimeMinutes: criteria.maxRuntimeMinutes,
    originalLanguage: criteria.originalLanguage,
    keywordIds: criteria.keywordIds,
    tvStatuses: criteria.tvStatuses,
    sort: criteria.sort,
  });

  return `/api/discovery/world-cinema?${params.toString()}`;
}

export function buildOnTvThisWeekPath(page = 1, pageSize = 20): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/discovery/on-tv-this-week?${params.toString()}`;
}

export function buildNowInTheatersPath(
  releaseRegion: string,
  page = 1,
  pageSize = 20,
): string {
  const params = new URLSearchParams({
    releaseRegion,
    page: String(page),
    pageSize: String(pageSize),
  });

  return `/api/discovery/now-in-theaters?${params.toString()}`;
}

export function buildExplorePreviewPath(sectionSize = DEFAULT_HOME_SECTION_SIZE): string {
  const params = new URLSearchParams({
    sectionSize: String(sectionSize),
  });

  return `/api/discovery/explore-preview?${params.toString()}`;
}

export function buildBrowsePath(criteria: DiscoveryBrowseRequest): string {
  const params = new URLSearchParams({
    mode: criteria.mode,
    type: criteria.type ?? 'all',
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_DISCOVERY_PAGE_SIZE),
  });

  appendSharedDiscoverFilters(
    params,
    {
      genreIds: criteria.genreIds,
      year: criteria.year,
      yearFrom: criteria.yearFrom,
      yearTo: criteria.yearTo,
      minRating: criteria.minRating,
      minVoteCount: criteria.minVoteCount,
      minRuntimeMinutes: criteria.minRuntimeMinutes,
      maxRuntimeMinutes: criteria.maxRuntimeMinutes,
      language: criteria.language,
      originCountry: criteria.originCountry,
      keywordIds: criteria.keywordIds,
      tvStatuses: criteria.tvStatuses,
      sort: criteria.sort,
    },
    { languageParamName: 'language' },
  );

  return `/api/discovery/browse?${params.toString()}`;
}

export function buildAdvancedDiscoverPath(criteria: AdvancedDiscoverRequest): string {
  const params = new URLSearchParams({
    mediaType: criteria.mediaType,
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE),
  });

  appendSharedDiscoverFilters(params, {
    genreIds: criteria.genreIds,
    genreMatch: criteria.genreMatch,
    year: criteria.year,
    yearFrom: criteria.yearFrom,
    yearTo: criteria.yearTo,
    minRating: criteria.minRating,
    maxRating: criteria.maxRating,
    minVoteCount: criteria.minVoteCount,
    minRuntimeMinutes: criteria.minRuntimeMinutes,
    maxRuntimeMinutes: criteria.maxRuntimeMinutes,
    originalLanguage: criteria.originalLanguage,
    originCountry: criteria.originCountry,
    keywordIds: criteria.keywordIds,
    tvStatuses: criteria.tvStatuses,
    sort: criteria.sort,
  });

  if (criteria.certification) {
    params.set('certification', criteria.certification);
  }

  if (criteria.certificationCountry) {
    params.set('certificationCountry', criteria.certificationCountry);
  }

  for (const releaseType of criteria.releaseTypes ?? []) {
    params.append('releaseType', releaseType);
  }

  if (criteria.watchRegion) {
    params.set('watchRegion', criteria.watchRegion);
  }

  for (const providerId of criteria.watchProviderIds ?? []) {
    params.append('watchProviderId', String(providerId));
  }

  for (const monetizationType of criteria.watchMonetizationTypes ?? []) {
    params.append('watchMonetizationType', monetizationType);
  }

  return `/api/discovery/advanced?${params.toString()}`;
}

export function buildPickSomethingPath(
  mediaType: string = 'all',
  excludeIds: readonly string[] = [],
): string {
  const params = new URLSearchParams({
    mediaType,
  });

  for (const excludeId of excludeIds) {
    params.append('excludeIds', excludeId);
  }

  return `/api/discovery/pick-something?${params.toString()}`;
}
