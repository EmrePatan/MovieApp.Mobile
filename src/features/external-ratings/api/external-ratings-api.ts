import { api } from '@/api/client';
import type { ExternalRatingsMediaType, ExternalRatingsResponse } from '../types';
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

  return api.get<ExternalRatingsResponse>(path, {
    authenticated: false,
    signal,
  });
}
