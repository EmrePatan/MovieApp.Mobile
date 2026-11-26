import { api } from '@/api/client';
import type { LeavingSoonRequest, LeavingSoonResponse } from './leaving-soon-types';

export function buildLeavingSoonPath(request: LeavingSoonRequest): string {
  const params = new URLSearchParams({
    watchRegion: request.watchRegion,
    type: request.mediaType ?? 'all',
    page: String(request.page ?? 1),
    pageSize: String(request.pageSize ?? 20),
  });

  for (const genreId of request.genreIds ?? []) {
    params.append('genreId', genreId);
  }

  // Same as the other discover lists: several categories must all match.
  if ((request.genreIds?.length ?? 0) > 1) {
    params.set('genreMatch', 'all');
  }

  // The endpoint only takes a range, so a single year is a range of one.
  const yearFrom = request.year ?? request.yearFrom;
  const yearTo = request.year ?? request.yearTo;

  const optional: Record<string, string | number | null | undefined> = {
    yearFrom,
    yearTo,
    minRating: request.minRating,
    minVoteCount: request.minVoteCount,
    minRuntimeMinutes: request.minRuntimeMinutes,
    maxRuntimeMinutes: request.maxRuntimeMinutes,
    originalLanguage: request.originalLanguage,
    originCountry: request.originCountry,
    sort: request.sort,
  };

  for (const [key, value] of Object.entries(optional)) {
    if (value != null && value !== '') {
      params.set(key, String(value));
    }
  }

  for (const providerId of request.watchProviderIds ?? []) {
    params.append('watchProviderId', String(providerId));
  }

  return `/api/discovery/leaving-soon?${params.toString()}`;
}

export async function getLeavingSoon(
  request: LeavingSoonRequest,
  signal?: AbortSignal,
): Promise<LeavingSoonResponse> {
  return api.get<LeavingSoonResponse>(buildLeavingSoonPath(request), {
    authenticated: false,
    signal,
  });
}
