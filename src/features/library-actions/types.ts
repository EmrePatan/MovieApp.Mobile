export interface LibraryActionStatusResponse {
  mediaType: 'movie' | 'tv';
  contentId: string;
  isFavorited: boolean;
  isInWatchlist: boolean;
  watchlistIds: string[];
  isFollowing: boolean;
  notifyNewSeasons: boolean;
  notifyNewEpisodes: boolean;
  baselineEstablished: boolean;
  isWatched: boolean | null;
  watchedAt: string | null;
}

export type LibraryActionMediaType = LibraryActionStatusResponse['mediaType'];
