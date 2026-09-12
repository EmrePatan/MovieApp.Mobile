import {
  buildEpisodeDetailRoute,
  buildMovieDetailRoute,
} from '@/features/details/shared/routes';
import type { RecentWatchHistoryItemResponse } from '../types';

export function buildRecentHistoryRoute(item: RecentWatchHistoryItemResponse): string | null {
  if (item.type === 'movie' && item.movieId) {
    return buildMovieDetailRoute(item.movieId);
  }

  if (
    item.type === 'episode' &&
    item.tvShowId &&
    item.seasonNumber != null &&
    item.episodeNumber != null
  ) {
    return buildEpisodeDetailRoute(item.tvShowId, item.seasonNumber, item.episodeNumber);
  }

  return null;
}

export function getRecentHistoryTitle(item: RecentWatchHistoryItemResponse): string {
  if (item.type === 'movie') {
    return item.title ?? 'Movie';
  }

  const episodeLabel =
    item.seasonNumber != null && item.episodeNumber != null
      ? `S${item.seasonNumber} E${item.episodeNumber}`
      : 'Episode';

  if (item.episodeTitle) {
    return `${item.tvShowTitle ?? 'TV Show'} · ${episodeLabel} · ${item.episodeTitle}`;
  }

  return `${item.tvShowTitle ?? 'TV Show'} · ${episodeLabel}`;
}

export function getRecentHistorySubtitle(item: RecentWatchHistoryItemResponse): string {
  return item.type === 'movie' ? 'Movie' : 'TV Episode';
}
