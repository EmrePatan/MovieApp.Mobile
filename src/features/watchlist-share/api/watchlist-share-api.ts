import { api } from '@/api/client';
import { pickWatchlistShareStatusEnabled } from '../ensure-watchlist-share-url-for-native-sheet';
import { pickWatchlistShareUrl } from '../pick-watchlist-share-url';



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



export interface WatchlistShareSummaryResponse {

  watchlistId: string;

  watchlistName: string;

}



export interface WatchlistShareListResponse {

  items: WatchlistShareSummaryResponse[];

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

  watchlistName: string | null;

  items: PublicWatchlistShareItemResponse[];

}



const PUBLIC_PATH = '/api/public/watchlists';

const ACTIVE_SHARES_PATH = '/api/watchlists/shares';



function sharePath(watchlistId: string) {

  return `/api/watchlists/${watchlistId}/share`;

}



export async function getWatchlistShareStatus(watchlistId: string, signal?: AbortSignal) {
  const raw = await api.get<WatchlistShareStatusResponse & { IsSharingEnabled?: boolean }>(
    sharePath(watchlistId),
    { signal },
  );

  return {
    isSharingEnabled: pickWatchlistShareStatusEnabled(raw),
  };
}



export async function listActiveWatchlistShares(signal?: AbortSignal) {

  return api.get<WatchlistShareListResponse>(ACTIVE_SHARES_PATH, { signal });

}



export async function enableWatchlistShare(watchlistId: string) {
  const raw = await api.post<
    WatchlistShareEnableResponse & { ShareUrl?: string | null; CreatedNewLink?: boolean }
  >(sharePath(watchlistId));

  return {
    shareUrl: pickWatchlistShareUrl(raw),
    createdNewLink: raw.createdNewLink ?? raw.CreatedNewLink ?? false,
  };
}



export async function disableWatchlistShare(watchlistId: string) {

  await api.delete<void>(sharePath(watchlistId));

}



export async function rotateWatchlistShare(watchlistId: string) {
  const raw = await api.post<WatchlistShareRotateResponse & { ShareUrl?: string }>(
    `${sharePath(watchlistId)}/rotate`,
  );
  const shareUrl = pickWatchlistShareUrl(raw);

  if (!shareUrl) {
    throw new Error('watchlist-share-rotate-missing-url');
  }

  return { shareUrl };
}



export async function getPublicWatchlistShare(token: string, signal?: AbortSignal) {

  return api.get<PublicWatchlistShareResponse>(`${PUBLIC_PATH}/${encodeURIComponent(token)}`, {

    signal,

  });

}


