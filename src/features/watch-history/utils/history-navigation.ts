import {
  buildEpisodeDetailRoute,
  buildMovieDetailRoute,
} from '@/features/details/shared/routes';
import { i18n } from '@/i18n';
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
  const movieLabel = i18n.t('contentType.movie');
  const tvShowLabel = i18n.t('contentType.tvShow');
  const episodeLabel = i18n.t('contentType.episode');

  if (item.type === 'movie') {
    return item.title ?? movieLabel;
  }

  const episodeNumberLabel =
    item.seasonNumber != null && item.episodeNumber != null
      ? `S${item.seasonNumber} E${item.episodeNumber}`
      : episodeLabel;

  if (item.episodeTitle) {
    return `${item.tvShowTitle ?? tvShowLabel} · ${episodeNumberLabel} · ${item.episodeTitle}`;
  }

  return `${item.tvShowTitle ?? tvShowLabel} · ${episodeNumberLabel}`;
}

export function getRecentHistorySubtitle(item: RecentWatchHistoryItemResponse): string {
  return item.type === 'movie'
    ? i18n.t('contentType.movie')
    : i18n.t('contentType.tvEpisode');
}
