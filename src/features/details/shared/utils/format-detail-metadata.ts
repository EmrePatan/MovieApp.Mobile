import { i18n } from '@/i18n';
import { translateContentType } from '@/i18n/catalog-labels';
import {
  formatCatalogYear,
  formatIsoDate,
  formatRating,
  formatRuntimeMinutes,
} from '@/utils/format';

export function formatMovieDetailMetadataLine(input: {
  releaseDate: string | null;
  runtimeMinutes: number | null;
  voteAverage: number;
}): string {
  const parts = [
    translateContentType('movie'),
    formatCatalogYear(input.releaseDate, null),
    input.voteAverage > 0
      ? i18n.t('common.ratingStar', { rating: formatRating(input.voteAverage) })
      : null,
    formatRuntimeMinutes(input.runtimeMinutes),
  ].filter(Boolean);

  return parts.join(' · ');
}

export function formatTvDetailMetadataLine(input: {
  firstAirDate: string | null;
  voteAverage: number;
  seasonCount: number;
}): string {
  const parts = [
    translateContentType('tv'),
    formatCatalogYear(input.firstAirDate, null),
    input.voteAverage > 0
      ? i18n.t('common.ratingStar', { rating: formatRating(input.voteAverage) })
      : null,
    input.seasonCount > 0
      ? i18n.t(input.seasonCount === 1 ? 'common.seasonCount' : 'common.seasonsCount', {
          count: input.seasonCount,
        })
      : null,
  ].filter(Boolean);

  return parts.join(' · ');
}

export function formatSeasonDetailMetadataLine(input: {
  seasonNumber: number;
  airDate: string | null;
  episodeCount: number | null;
}): string {
  const year = input.airDate ? input.airDate.slice(0, 4) : null;
  const parts = [
    i18n.t('details.metadata.seasonDetail', { number: input.seasonNumber }),
    year,
    input.episodeCount != null
      ? i18n.t(input.episodeCount === 1 ? 'common.episodeCount' : 'common.episodesCount', {
          count: input.episodeCount,
        })
      : null,
  ].filter(Boolean);

  return parts.join(' · ');
}

export function formatEpisodeDetailMetadataLine(input: {
  seasonNumber: number;
  episodeNumber: number;
  airDate: string | null;
  runtimeMinutes: number | null;
  voteAverage: number;
}): string {
  const parts = [
    i18n.t('details.metadata.episodeDetail', {
      season: input.seasonNumber,
      episode: input.episodeNumber,
    }),
    formatIsoDate(input.airDate),
    formatRuntimeMinutes(input.runtimeMinutes),
    input.voteAverage > 0
      ? i18n.t('common.ratingStar', { rating: formatRating(input.voteAverage) })
      : null,
  ].filter(Boolean);

  return parts.join(' · ');
}

export function formatEpisodeBreadcrumb(input: {
  seasonNumber: number;
  episodeNumber: number;
}): string {
  return i18n.t('details.metadata.breadcrumb', {
    season: input.seasonNumber,
    episode: input.episodeNumber,
  });
}
