import { api } from '@/api/client';
import type { ExternalRatingsMediaType, ExternalRatingsResponse } from '../types';
import { normalizeExternalRatingsResponse } from '../utils/normalize-external-ratings-response';
import { buildMovieExternalRatingsPath, buildTvShowExternalRatingsPath } from './routes';

export async function getExternalRatings(
  mediaType: ExternalRatingsMediaType,
  contentId: string,
  signal?: AbortSignal,
): Promise<ExternalRatingsResponse> {
  const path =
    mediaType === 'movie'
      ? buildMovieExternalRatingsPath(contentId)
      : buildTvShowExternalRatingsPath(contentId);

  const raw = await api.get<unknown>(path, {
    authenticated: false,
    signal,
  });

  return normalizeExternalRatingsResponse(raw);
}
