import type { ImperativeRouter } from 'expo-router';

export const STREAMING_DISCOVER_PARAM_KEYS = [
  'mediaType',
  'watchRegion',
  'watchProviderId',
  'watchMonetizationType',
  'minRating',
  'sort',
] as const;

export const ADVANCED_DISCOVER_PARAM_KEYS = [
  'mediaType',
  'genres',
  'year',
  'yearFrom',
  'yearTo',
  'minRating',
  'minRuntime',
  'maxRuntime',
  'language',
  'originCountry',
  'watchRegion',
  'watchProviderId',
  'watchMonetizationType',
  'sort',
] as const;

export const NOW_IN_THEATERS_PARAM_KEYS = ['releaseRegion'] as const;

export const WORLD_CINEMA_PARAM_KEYS = ['mediaType', 'originCountry', 'sort'] as const;

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
