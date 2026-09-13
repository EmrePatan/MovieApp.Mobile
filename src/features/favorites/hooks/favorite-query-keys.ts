export function favoritesListQueryKey(page = 1, pageSize = 50) {
  return ['favorites', page, pageSize] as const;
}

export function favoritesInfiniteQueryKey(pageSize = 20) {
  return ['favorites', pageSize] as const;
}

export function favoriteStatusQueryKey(contentType: 'movie' | 'tv', contentId: string) {
  return ['favorite', contentType, contentId] as const;
}
