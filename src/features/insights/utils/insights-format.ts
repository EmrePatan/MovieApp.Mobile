import type { InsightsActivityDayState } from '../types';

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function normalizeActivityDayState(state: InsightsActivityDayState): 'active' | 'noActivity' | 'beforeJoin' {
  if (state === 'Active' || state === 0) {
    return 'active';
  }

  if (state === 'BeforeJoin' || state === 2) {
    return 'beforeJoin';
  }

  return 'noActivity';
}

export function formatWeekdayName(dayOfWeek: number): string {
  return WEEKDAY_NAMES[dayOfWeek] ?? 'Unknown';
}

export function formatEstimatedDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return '0m';
  }

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours < 24) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function formatAverageStarRating(value: number | null): string {
  if (value === null) {
    return '—';
  }

  return value.toFixed(1);
}

export function formatAchievedDate(achievedAt: string): string {
  return new Date(achievedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getWatchingMixPercentages(movieTitleCount: number, seriesTitleCount: number) {
  const total = movieTitleCount + seriesTitleCount;

  if (total <= 0) {
    return { moviePercent: 0, seriesPercent: 0 };
  }

  const seriesPercent = Math.round((seriesTitleCount / total) * 100);
  return {
    moviePercent: 100 - seriesPercent,
    seriesPercent,
  };
}

export function getActivityDayAccessibilityLabel(
  date: string,
  movies: number,
  episodes: number,
  state: InsightsActivityDayState,
  total: number,
): string {
  const normalized = normalizeActivityDayState(state);

  if (normalized === 'beforeJoin') {
    return `${date}: before you joined MovieApp`;
  }

  if (normalized === 'noActivity') {
    return `${date}: no activity`;
  }

  return `${date}: ${total} watched items, ${movies} movies and ${episodes} episodes`;
}
