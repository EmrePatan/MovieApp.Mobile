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

  return api.get<WatchlistShareStatusResponse>(sharePath(watchlistId), { signal });

}



export async function listActiveWatchlistShares(signal?: AbortSignal) {

  return api.get<WatchlistShareListResponse>(ACTIVE_SHARES_PATH, { signal });

}



export async function enableWatchlistShare(watchlistId: string) {

  return api.post<WatchlistShareEnableResponse>(sharePath(watchlistId));

}



export async function disableWatchlistShare(watchlistId: string) {

  await api.delete<void>(sharePath(watchlistId));

}



export async function rotateWatchlistShare(watchlistId: string) {

  return api.post<WatchlistShareRotateResponse>(`${sharePath(watchlistId)}/rotate`);

}



export async function getPublicWatchlistShare(token: string, signal?: AbortSignal) {

  return api.get<PublicWatchlistShareResponse>(`${PUBLIC_PATH}/${encodeURIComponent(token)}`, {

    signal,

  });

}


