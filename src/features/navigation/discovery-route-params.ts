import type { ImperativeRouter } from 'expo-router';

export const BROWSE_DISCOVER_PARAM_KEYS = [
  'mode',
  'type',
  'genres',
  'year',
  'yearFrom',
  'yearTo',
  'minRating',
  'minVoteCount',
  'minRuntime',
  'maxRuntime',
  'language',
  'originCountry',
  'keywords',
  'keywordLabels',
  'tvStatus',
  'sort',
] as const;

export const STREAMING_DISCOVER_PARAM_KEYS = [
  'mediaType',
  'watchRegion',
  'watchProviderId',
  'watchMonetizationType',
  'genres',
  'year',
  'yearFrom',
  'yearTo',
  'minRating',
  'minVoteCount',
  'minRuntime',
  'maxRuntime',
  'language',
  'originCountry',
  'keywords',
  'tvStatus',
  'sort',
] as const;

export const ADVANCED_DISCOVER_PARAM_KEYS = [
  'mediaType',
  'genres',
  'genreMatch',
  'year',
  'yearFrom',
  'yearTo',
  'minRating',
  'maxRating',
  'minVoteCount',
  'minRuntime',
  'maxRuntime',
  'language',
  'originCountry',
  'certification',
  'certificationCountry',
  'releaseType',
  'watchRegion',
  'watchProviderId',
  'watchMonetizationType',
  'keywords',
  'tvStatus',
  'sort',
] as const;

export const NOW_IN_THEATERS_PARAM_KEYS = ['releaseRegion'] as const;

export const WORLD_CINEMA_PARAM_KEYS = [
  'mediaType',
  'originCountry',
  'sort',
  'genres',
  'genreMatch',
  'year',
  'yearFrom',
  'yearTo',
  'minRating',
  'maxRating',
  'minVoteCount',
  'minRuntime',
  'maxRuntime',
  'language',
  'keywords',
  'tvStatus',
] as const;

export function setDiscoveryRouteParams(
  router: Pick<ImperativeRouter, 'setParams'>,
  serializedParams: Record<string, string>,
  allParamKeys: readonly string[],
): void {
  const nextParams: Record<string, string | undefined> = {};

  for (const key of allParamKeys) {
    nextParams[key] = serializedParams[key] ?? undefined;
  }

  router.setParams(nextParams);
}
