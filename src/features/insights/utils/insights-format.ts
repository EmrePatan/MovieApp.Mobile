import {
  translateAchievementCategory,
  translateMovieDnaEditorialByCode,
  translateMovieDnaEditorialFallback,
  translateGenreName,
  translateMovieDnaGenreTitle,
  type MovieDnaEditorialCode,
} from '@/i18n/catalog-labels';
import { getUiFormatLocaleTag, i18n } from '@/i18n';
import type { InsightsV3MovieDna } from '../types';

export function formatWeekdayName(dayOfWeek: number | string | null | undefined): string {
  if (dayOfWeek == null) {
    return '—';
  }

  if (typeof dayOfWeek === 'string') {
    return dayOfWeek;
  }

  const key = `insights.format.weekdays.${dayOfWeek}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }

  return i18n.t('common.unknown');
}

export function formatMonthName(month: number): string {
  const key = `insights.format.monthsShort.${month}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }

  return String(month);
}

export function formatMonthYear(month: number, year: number): string {
  return i18n.t('insights.format.monthYear', {
    month: formatMonthName(month),
    year,
  });
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

export function formatHoursFromMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return '0';
  }

  const hours = totalMinutes / 60;
  return hours >= 10 ? Math.round(hours).toString() : hours.toFixed(1);
}

export function formatEquivalentDays(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return i18n.t('insights.format.equivalentDays.zero');
  }

  const days = totalMinutes / (60 * 24);
  if (days < 1) {
    return i18n.t('insights.format.equivalentDays.underOne');
  }

  const rounded = Math.round(days);
  if (rounded === 1) {
    return i18n.t('insights.format.equivalentDays.one');
  }

  return i18n.t('insights.format.equivalentDays.many', { count: rounded });
}

export function formatAverageStarRating(value: number | null | undefined): string {
  if (value == null) {
    return '—';
  }

  return value.toFixed(1);
}

export function formatAchievedDate(achievedAt: string): string {
  return new Date(achievedAt).toLocaleDateString(getUiFormatLocaleTag(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatIsoWeekLabel(year: number, week: number): string {
  return i18n.t('insights.format.weekLabel', { week, year });
}

export function getMemberSinceYear(memberSinceUtc: string): number {
  return new Date(memberSinceUtc).getFullYear();
}

export function buildSelectableYears(memberSinceUtc: string, currentYear: number): number[] {
  const firstYear = Math.min(getMemberSinceYear(memberSinceUtc), currentYear);
  const years: number[] = [];

  for (let year = currentYear; year >= firstYear; year -= 1) {
    years.push(year);
  }

  return years;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getElapsedDaysInYear(year: number, asOf = new Date()): number {
  if (year < asOf.getFullYear()) {
    return isLeapYear(year) ? 366 : 365;
  }

  if (year > asOf.getFullYear()) {
    return 0;
  }

  const start = new Date(year, 0, 1);
  const diff = Math.floor((asOf.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.max(diff, 1);
}

export function formatActiveYearDayPercent(
  activeDays: number,
  year: number,
  asOf = new Date(),
): number | null {
  if (activeDays <= 0) {
    return null;
  }

  const elapsedDays = getElapsedDaysInYear(year, asOf);
  if (elapsedDays <= 0) {
    return null;
  }

  return Math.min(100, Math.round((activeDays / elapsedDays) * 100));
}

function getTopGenreName(movieDna: InsightsV3MovieDna): string | null {
  const fromGenres = movieDna.topGenres[0]?.name;
  if (fromGenres) {
    return fromGenres;
  }

  const genreLabel = movieDna.labels.find((label) => label.code === 'top_genre');
  return genreLabel?.label ?? null;
}

export function formatMovieDnaDisplayTitle(movieDna: InsightsV3MovieDna): string {
  const genreName = getTopGenreName(movieDna);
  if (!genreName) {
    return i18n.t('insights.movieDna.defaultTitle');
  }

  return translateMovieDnaGenreTitle(genreName);
}

const MOVIE_DNA_EDITORIAL_CODE_PRIORITY = [
  'recent_releases',
  'series_first',
  'movie_first',
  'top_genre',
] as const satisfies readonly MovieDnaEditorialCode[];

const MIN_TITLES_FOR_EDITORIAL = 5;

export function formatMovieDnaEditorialLine(movieDna: InsightsV3MovieDna): string {
  for (const code of MOVIE_DNA_EDITORIAL_CODE_PRIORITY) {
    if (movieDna.identityCodes.includes(code)) {
      return translateMovieDnaEditorialByCode(code);
    }
  }

  const { movieTitleCount, seriesTitleCount, movieSharePercent, seriesSharePercent } =
    movieDna.watchingMix;
  const totalTitles = movieTitleCount + seriesTitleCount;

  if (totalTitles < MIN_TITLES_FOR_EDITORIAL) {
    return translateMovieDnaEditorialFallback('findingSignature');
  }

  if (movieSharePercent >= 35 && seriesSharePercent >= 35) {
    return translateMovieDnaEditorialFallback('balancedMix');
  }

  if (seriesSharePercent >= 60) {
    return translateMovieDnaEditorialFallback('seriesHeavy');
  }

  if (movieSharePercent >= 60) {
    return translateMovieDnaEditorialFallback('movieHeavy');
  }

  const topShare = movieDna.topGenres[0]?.sharePercent ?? 0;
  if (topShare >= 25) {
    return translateMovieDnaEditorialFallback('genreCircle');
  }

  return translateMovieDnaEditorialFallback('default');
}

export function formatWatchingMixLine(movieSharePercent: number, seriesSharePercent: number): string {
  return i18n.t('insights.movieDna.watchingMixLine', {
    movies: Math.round(movieSharePercent),
    series: Math.round(seriesSharePercent),
  });
}

export function formatGenreGravitation(genreNames: string[]): string | null {
  if (genreNames.length === 0) {
    return null;
  }

  if (genreNames.length === 1) {
    return i18n.t('insights.movieDna.gravitation.one', {
      genre: translateGenreName(genreNames[0]),
    });
  }

  if (genreNames.length === 2) {
    return i18n.t('insights.movieDna.gravitation.two', {
      first: translateGenreName(genreNames[0]),
      second: translateGenreName(genreNames[1]),
    });
  }

  const last = translateGenreName(genreNames[genreNames.length - 1]);
  const rest = genreNames
    .slice(0, -1)
    .map((genreName) => translateGenreName(genreName))
    .join(', ');
  return i18n.t('insights.movieDna.gravitation.many', { list: rest, last });
}

export function formatDominantGenreHeadline(genreName: string): string {
  return i18n.t('insights.movieDna.dominantGenreHeadline', {
    genreName: translateGenreName(genreName),
  });
}

export function formatDecadeLabel(bucket: string): string {
  return bucket;
}

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = MINUTES_PER_HOUR * 24;
const MINUTES_PER_MONTH = MINUTES_PER_DAY * 30;
const MINUTES_PER_YEAR = MINUTES_PER_DAY * 365;

export function formatWatchTimeBreakdown(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return '0h';
  }

  let remaining = Math.floor(totalMinutes);
  const years = Math.floor(remaining / MINUTES_PER_YEAR);
  remaining %= MINUTES_PER_YEAR;
  const months = Math.floor(remaining / MINUTES_PER_MONTH);
  remaining %= MINUTES_PER_MONTH;
  const days = Math.floor(remaining / MINUTES_PER_DAY);
  remaining %= MINUTES_PER_DAY;
  const hours = Math.floor(remaining / MINUTES_PER_HOUR);
  const minutes = remaining % MINUTES_PER_HOUR;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years}y`);
  }
  if (months > 0) {
    parts.push(`${months}mo`);
  }
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (parts.length === 0 && minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (parts.length === 0) {
    parts.push('0h');
  }

  return parts.join(' ');
}

export function formatHoursShort(totalMinutes: number): string {
  return formatWatchTimeBreakdown(totalMinutes);
}

export function formatAchievementBadgeNumber(value: number): string {
  return value.toLocaleString(getUiFormatLocaleTag());
}

export function formatAchievementCategoryLabel(category: string): string {
  return translateAchievementCategory(category);
}

export type AchievementIconName =
  | 'film-outline'
  | 'tv-outline'
  | 'star-outline'
  | 'albums-outline'
  | 'grid-outline'
  | 'ribbon-outline';

export function getAchievementIconName(category: string): AchievementIconName {
  switch (category) {
    case 'movies':
      return 'film-outline';
    case 'episodes':
      return 'tv-outline';
    case 'ratings':
      return 'star-outline';
    case 'shows':
      return 'albums-outline';
    case 'genres':
      return 'grid-outline';
    default:
      return 'ribbon-outline';
  }
}
