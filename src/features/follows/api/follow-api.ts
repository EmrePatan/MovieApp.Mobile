import { api } from '@/api/client';
import { buildTvShowFollowStatusPath } from './routes';
import type { TvShowFollowStatusResponse, UpsertTvShowFollowRequest } from '../types';

export async function getTvShowFollowStatus(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<TvShowFollowStatusResponse> {
  return api.get<TvShowFollowStatusResponse>(buildTvShowFollowStatusPath(tvShowId), { signal });
}

export async function upsertTvShowFollow(
  tvShowId: string,
  request: UpsertTvShowFollowRequest,
): Promise<TvShowFollowStatusResponse> {
  return api.put<TvShowFollowStatusResponse>(buildTvShowFollowStatusPath(tvShowId), request);
}

export async function removeTvShowFollow(tvShowId: string): Promise<void> {
  await api.delete<void>(buildTvShowFollowStatusPath(tvShowId));
}
