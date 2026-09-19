import { i18n } from '@/i18n';

export function clampProgressPercentage(progressPercentage: number): number {
  if (!Number.isFinite(progressPercentage)) {
    return 0;
  }

  return Math.max(0, Math.min(100, progressPercentage));
}

export function formatWatchProgressEpisodeSummary(
  watchedEpisodes: number,
  totalEpisodes: number,
): string {
  return i18n.t('common.episodesWatchedSummary', {
    watched: watchedEpisodes,
    total: totalEpisodes,
  });
}

export function formatProgressPercentDisplay(progressPercentage: number): string {
  return i18n.t('common.percentComplete', {
    percent: Math.round(clampProgressPercentage(progressPercentage)),
  });
}

/** @deprecated Use formatWatchProgressEpisodeSummary for detail UI. */
export function formatWatchProgressLabel(
  watchedEpisodes: number,
  totalEpisodes: number,
): string {
  return `${watchedEpisodes} / ${totalEpisodes} episodes watched`;
}

/** @deprecated Use formatProgressPercentDisplay for detail UI. */
export function formatProgressPercentage(progressPercentage: number): string {
  return formatProgressPercentDisplay(progressPercentage);
}

interface NextEpisodeLike {
  seasonNumber?: number;
  episodeNumber: number;
  title?: string | null;
}

export function formatNextEpisodeLine(
  nextEpisode: NextEpisodeLike,
  includeSeasonNumber = true,
): string {
  if (includeSeasonNumber && nextEpisode.seasonNumber != null) {
    const titleSuffix = nextEpisode.title?.trim()
      ? i18n.t('common.seasonEpisodeTitleSuffix', { title: nextEpisode.title.trim() })
      : '';

    return i18n.t('common.seasonEpisodeWithTitle', {
      season: nextEpisode.seasonNumber,
      episode: nextEpisode.episodeNumber,
      titleSuffix,
    });
  }

  if (nextEpisode.title?.trim()) {
    return `${i18n.t('common.episode')} ${nextEpisode.episodeNumber} · ${nextEpisode.title.trim()}`;
  }

  return `${i18n.t('common.episode')} ${nextEpisode.episodeNumber}`;
}

export function getWatchProgressCompletionLabel(
  watchedEpisodes: number,
  totalEpisodes: number,
  hasNextEpisode: boolean,
): string | null {
  if (hasNextEpisode) {
    return null;
  }

  if (totalEpisodes > 0 && watchedEpisodes >= totalEpisodes) {
    return i18n.t('common.allEpisodesWatched');
  }

  return null;
}
