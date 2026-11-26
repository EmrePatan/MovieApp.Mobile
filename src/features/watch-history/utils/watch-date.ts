import { getUiFormatLocaleTag } from '@/i18n';
import { formatIsoDate } from '@/utils/format';
import type { RecentWatchHistoryItemResponse } from '../types';

export const MAX_WATCH_DATE_SELECTION = 500;
export const MIN_WATCH_YEAR = 1900;

/** Label for a card; null when the date must not be shown. */
export function formatWatchedDate(
  watchedAt: string,
  precision: RecentWatchHistoryItemResponse['watchedAtPrecision'],
): string | null {
  if (precision === 'unknown') {
    return null;
  }

  return precision === 'year' ? watchedAt.slice(0, 4) : formatIsoDate(watchedAt.slice(0, 10));
}

/** Date of a show card: the day when all its episodes share one, otherwise their month. */
export function formatWatchedGroupDate(
  episodes: RecentWatchHistoryItemResponse[],
): string | null {
  const first = episodes[0];
  if (!first) {
    return null;
  }

  const day = first.watchedAt.slice(0, 10);
  const sameDay = episodes.every((episode) => episode.watchedAt.slice(0, 10) === day);
  if (sameDay || first.watchedAtPrecision === 'year' || first.watchedAtPrecision === 'unknown') {
    return formatWatchedDate(first.watchedAt, first.watchedAtPrecision);
  }

  return new Intl.DateTimeFormat(getUiFormatLocaleTag(), {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${day}T00:00:00`));
}

export function getSelectionKey(item: RecentWatchHistoryItemResponse): string | null {
  const id = item.type === 'movie' ? item.movieId : item.episodeId;
  return id ? `${item.type}:${id}` : null;
}

export function splitSelection(keys: Iterable<string>) {
  const movieIds: string[] = [];
  const episodeIds: string[] = [];

  for (const key of keys) {
    const [type, id] = key.split(':') as [string, string];
    (type === 'movie' ? movieIds : episodeIds).push(id);
  }

  return { movieIds, episodeIds };
}

export function toIsoDay(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}
