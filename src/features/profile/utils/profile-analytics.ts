import { getUiFormatLocaleTag } from '@/i18n';
import type {
  MonthlyActivityResponse,
  UserStatisticsActivityResponse,
  UserStatisticsResponse,
} from '../types';

export function getTotalWatchedCount(statistics: UserStatisticsResponse): number {
  return statistics.summary.moviesWatched + statistics.summary.episodesWatched;
}

export function formatMonthLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleString(getUiFormatLocaleTag(), { month: 'short' });
}

export function formatMonthDetailLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleString(getUiFormatLocaleTag(), {
    month: 'long',
    year: 'numeric',
  });
}

export function getMonthAccessibilityLabel(month: MonthlyActivityResponse): string {
  const label = formatMonthDetailLabel(month.month, month.year);
  return `${label}: ${month.total} watched items, ${month.movies} movies and ${month.episodes} episodes.`;
}

export function getPreviousMonthComparison(activity: UserStatisticsActivityResponse): number | null {
  if (activity.previousMonthTotal <= 0) {
    return activity.currentMonthTotal > 0 ? 100 : null;
  }

  return Math.round(
    ((activity.currentMonthTotal - activity.previousMonthTotal) / activity.previousMonthTotal) * 100,
  );
}

export function getGenrePercentage(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

export function getWatchingMixPercentages(statistics: UserStatisticsResponse): {
  moviePercent: number;
  tvPercent: number;
} {
  const total =
    statistics.watchingMix.movieTitleCount + statistics.watchingMix.seriesTitleCount;

  if (total <= 0) {
    return { moviePercent: 0, tvPercent: 0 };
  }

  const tvPercent = Math.round((statistics.watchingMix.seriesTitleCount / total) * 100);
  return {
    moviePercent: 100 - tvPercent,
    tvPercent,
  };
}

export function hasMeaningfulAnalytics(statistics: UserStatisticsResponse): boolean {
  return getTotalWatchedCount(statistics) > 0 || statistics.summary.ratingsCount > 0;
}

export function formatAverageRating(value: number | null): string {
  if (value === null) {
    return '—';
  }

  return `${value.toFixed(1)}★`;
}
