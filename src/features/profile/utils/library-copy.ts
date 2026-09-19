import { i18n } from '@/i18n';

function formatCountLabel(
  count: number,
  singularKey: string,
  pluralKey: string,
): string {
  const key = count === 1 ? singularKey : pluralKey;
  return i18n.t(key, { count });
}

export function formatFavoritesSubtitle(favoritesCount: number): string {
  return formatCountLabel(
    favoritesCount,
    'profile.preview.libraryCopy.savedTitle',
    'profile.preview.libraryCopy.savedTitles',
  );
}

export function formatWatchlistSubtitle(watchlistCount: number): string {
  return formatCountLabel(
    watchlistCount,
    'profile.preview.libraryCopy.list',
    'profile.preview.libraryCopy.lists',
  );
}

export function formatWatchHistorySubtitle(
  moviesWatched: number,
  episodesWatched: number,
): string {
  const movies = formatCountLabel(
    moviesWatched,
    'profile.preview.libraryCopy.movie',
    'profile.preview.libraryCopy.movies',
  );
  const episodes = formatCountLabel(
    episodesWatched,
    'profile.preview.libraryCopy.episode',
    'profile.preview.libraryCopy.episodes',
  );
  return `${movies} · ${episodes}`;
}

export function formatFollowingSubtitle(followingCount: number): string {
  return formatCountLabel(
    followingCount,
    'profile.preview.libraryCopy.followedTitle',
    'profile.preview.libraryCopy.followedTitles',
  );
}
