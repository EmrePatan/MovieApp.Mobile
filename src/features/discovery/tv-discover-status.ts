/**
 * Typed TMDB Discover TV `with_status` values.
 * Wire format matches backend: returning_series | planned | in_production | ended | canceled | pilot.
 * Do not leak raw 0..5 integers into UI/route state.
 */
export type TvDiscoverStatus =
  | 'returning_series'
  | 'planned'
  | 'in_production'
  | 'ended'
  | 'canceled'
  | 'pilot';

export const TV_DISCOVER_STATUS_OPTIONS: readonly TvDiscoverStatus[] = [
  'returning_series',
  'planned',
  'in_production',
  'ended',
  'canceled',
  'pilot',
] as const;

const TV_DISCOVER_STATUS_SET = new Set<string>(TV_DISCOVER_STATUS_OPTIONS);

export function isTvDiscoverStatus(value: string): value is TvDiscoverStatus {
  return TV_DISCOVER_STATUS_SET.has(value);
}

export function parseTvDiscoverStatuses(
  value: string | string[] | undefined,
): TvDiscoverStatus[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const statuses = rawValues
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim().toLowerCase())
    .filter(isTvDiscoverStatus);

  return Array.from(new Set(statuses));
}
