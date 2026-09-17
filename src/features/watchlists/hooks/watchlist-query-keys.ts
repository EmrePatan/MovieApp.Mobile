export function watchlistsQueryKey() {
  return ['watchlists'] as const;
}

export function watchlistQueryKey(watchlistId: string) {
  return ['watchlist', watchlistId] as const;
}

export function watchlistItemsQueryKey(watchlistId: string, page = 1, pageSize = 20) {
  return ['watchlist', watchlistId, 'items', page, pageSize] as const;
}

export function watchlistItemsInfiniteQueryKey(
  watchlistId: string,
  pageSize = 20,
  mediaType: string = 'all',
  sort: string = 'recentlyAdded',
) {
  return ['watchlist', watchlistId, 'items', pageSize, mediaType, sort] as const;
}

export function watchlistMembershipQueryKey(
  contentType: 'movie' | 'tv',
  contentId: string,
) {
  return ['watchlist-membership', contentType, contentId] as const;
}
