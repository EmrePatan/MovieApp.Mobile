import {
  formatCatalogYear,
  formatContentType,
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
    formatContentType('movie'),
    formatCatalogYear(input.releaseDate, null),
    input.voteAverage > 0 ? `★ ${formatRating(input.voteAverage)}` : null,
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
    formatContentType('tv'),
    formatCatalogYear(input.firstAirDate, null),
    input.voteAverage > 0 ? `★ ${formatRating(input.voteAverage)}` : null,
    input.seasonCount > 0
      ? `${input.seasonCount} ${input.seasonCount === 1 ? 'Season' : 'Seasons'}`
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
    `Season ${input.seasonNumber}`,
    year,
    input.episodeCount != null
      ? `${input.episodeCount} ${input.episodeCount === 1 ? 'Episode' : 'Episodes'}`
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
    `S${input.seasonNumber} E${input.episodeNumber}`,
    formatIsoDate(input.airDate),
    formatRuntimeMinutes(input.runtimeMinutes),
    input.voteAverage > 0 ? `★ ${formatRating(input.voteAverage)}` : null,
  ].filter(Boolean);

  return parts.join(' · ');
}

export function formatEpisodeBreadcrumb(input: {
  seasonNumber: number;
  episodeNumber: number;
}): string {
  return `Season ${input.seasonNumber} · Episode ${input.episodeNumber}`;
}
