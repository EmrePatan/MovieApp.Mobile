export function formatCountLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatFavoritesSubtitle(favoritesCount: number): string {
  return `${formatCountLabel(favoritesCount, 'saved title', 'saved titles')}`;
}

export function formatWatchlistSubtitle(watchlistCount: number): string {
  return `${formatCountLabel(watchlistCount, 'list', 'lists')}`;
}

export function formatWatchHistorySubtitle(
  moviesWatched: number,
  episodesWatched: number,
): string {
  const movies = formatCountLabel(moviesWatched, 'movie', 'movies');
  const episodes = formatCountLabel(episodesWatched, 'episode', 'episodes');
  return `${movies} · ${episodes}`;
}

export function formatFollowingSubtitle(followingCount: number): string {
  return `${formatCountLabel(followingCount, 'followed title', 'followed titles')}`;
}
