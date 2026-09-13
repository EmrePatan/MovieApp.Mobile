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
  const episodeLabel = totalEpisodes === 1 ? 'episode' : 'episodes';
  return `${watchedEpisodes} of ${totalEpisodes} ${episodeLabel}`;
}

export function formatProgressPercentDisplay(progressPercentage: number): string {
  return `${Math.round(clampProgressPercentage(progressPercentage))}%`;
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
  return `${formatProgressPercentDisplay(progressPercentage)} complete`;
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
  const identifier =
    includeSeasonNumber && nextEpisode.seasonNumber != null
      ? `S${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber}`
      : `E${nextEpisode.episodeNumber}`;

  if (nextEpisode.title?.trim()) {
    return `${identifier} · ${nextEpisode.title.trim()}`;
  }

  return identifier;
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
    return 'All episodes watched';
  }

  return null;
}
