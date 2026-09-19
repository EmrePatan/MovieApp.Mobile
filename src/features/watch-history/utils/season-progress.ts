import { clampProgressPercentage } from './progress-format';
import { i18n } from '@/i18n';

export type SeasonProgressState = 'not-started' | 'in-progress' | 'completed';

export function normalizeProgressCounts(
  watchedEpisodes: number,
  totalEpisodes: number,
): { watchedEpisodes: number; totalEpisodes: number } {
  const safeTotal = Math.max(0, totalEpisodes);
  const safeWatched = Math.max(0, watchedEpisodes);
  const clampedWatched = safeTotal > 0 ? Math.min(safeWatched, safeTotal) : safeWatched;

  return {
    watchedEpisodes: clampedWatched,
    totalEpisodes: safeTotal,
  };
}

export function calculateSeasonProgressPercentage(
  watchedEpisodes: number,
  totalEpisodes: number,
): number {
  const { watchedEpisodes: watched, totalEpisodes: total } = normalizeProgressCounts(
    watchedEpisodes,
    totalEpisodes,
  );

  if (total === 0) {
    return 0;
  }

  return clampProgressPercentage((watched / total) * 100);
}

export function getSeasonProgressState(
  watchedEpisodes: number,
  totalEpisodes: number,
): SeasonProgressState {
  const { watchedEpisodes: watched, totalEpisodes: total } = normalizeProgressCounts(
    watchedEpisodes,
    totalEpisodes,
  );

  if (total === 0 || watched === 0) {
    return 'not-started';
  }

  if (watched >= total) {
    return 'completed';
  }

  return 'in-progress';
}

export function formatSeasonProgressCount(
  watchedEpisodes: number,
  totalEpisodes: number,
): string {
  const { watchedEpisodes: watched, totalEpisodes: total } = normalizeProgressCounts(
    watchedEpisodes,
    totalEpisodes,
  );

  return `${watched} / ${total}`;
}

export function formatTvShowWatchedSummary(
  watchedEpisodes: number,
  totalEpisodes: number,
): string | null {
  const { watchedEpisodes: watched, totalEpisodes: total } = normalizeProgressCounts(
    watchedEpisodes,
    totalEpisodes,
  );

  if (total === 0) {
    return null;
  }

  return i18n.t('common.episodesWatchedSummary', {
    watched,
    total,
  });
}
