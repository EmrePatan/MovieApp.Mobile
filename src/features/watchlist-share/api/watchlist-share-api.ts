import { api } from '@/api/client';

export interface WatchlistShareStatusResponse {
  isSharingEnabled: boolean;
}

export interface WatchlistShareEnableResponse {
  shareUrl: string | null;
  createdNewLink: boolean;
}

export interface WatchlistShareRotateResponse {
  shareUrl: string;
}

export interface PublicWatchlistShareItemResponse {
  contentType: 'movie' | 'tv';
  contentId: string;
  title: string;
  year: number | null;
  posterPath: string | null;
  voteAverage: number;
}

export interface PublicWatchlistShareResponse {
  ownerDisplayName: string | null;
  items: PublicWatchlistShareItemResponse[];
}

const SHARE_PATH = '/api/watchlists/share';
const PUBLIC_PATH = '/api/public/watchlists';

export async function getWatchlistShareStatus(signal?: AbortSignal) {
  return api.get<WatchlistShareStatusResponse>(SHARE_PATH, { signal });
}

export async function enableWatchlistShare(watchlistId: string) {
  return api.post<WatchlistShareEnableResponse>(`${SHARE_PATH}/enable`, { watchlistId });
}

export async function disableWatchlistShare() {
  await api.delete<void>(SHARE_PATH);
}

export async function rotateWatchlistShare(watchlistId: string) {
  return api.post<WatchlistShareRotateResponse>(`${SHARE_PATH}/rotate`, { watchlistId });
}

export async function getPublicWatchlistShare(token: string, signal?: AbortSignal) {
  return api.get<PublicWatchlistShareResponse>(`${PUBLIC_PATH}/${encodeURIComponent(token)}`, {
    signal,
  });
}
