import type { ExternalRatingItem, ExternalRatingsResponse } from '../types';

export function isValidExternalRatingItem(value: unknown): value is ExternalRatingItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const rating = value as Partial<ExternalRatingItem>;
  return (
    typeof rating.source === 'string' &&
    rating.source.length > 0 &&
    typeof rating.value === 'number' &&
    Number.isFinite(rating.value) &&
    typeof rating.scale === 'number' &&
    Number.isFinite(rating.scale) &&
    rating.scale > 0
  );
}

export function normalizeExternalRatingsResponse(raw: unknown): ExternalRatingsResponse {
  if (!raw || typeof raw !== 'object') {
    return { fetchedAtUtc: null, isStale: false, ratings: [] };
  }

  const data = raw as Partial<ExternalRatingsResponse>;
  const ratings = Array.isArray(data.ratings)
    ? data.ratings.filter(isValidExternalRatingItem)
    : [];

  return {
    fetchedAtUtc: typeof data.fetchedAtUtc === 'string' ? data.fetchedAtUtc : null,
    isStale: Boolean(data.isStale),
    ratings,
  };
}
