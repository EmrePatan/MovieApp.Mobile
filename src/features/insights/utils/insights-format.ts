import type { InsightsV3MovieDna } from '../types';

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatWeekdayName(dayOfWeek: number | string | null | undefined): string {
  if (dayOfWeek == null) {
    return '—';
  }

  if (typeof dayOfWeek === 'string') {
    return dayOfWeek;
  }

  return WEEKDAY_NAMES[dayOfWeek] ?? 'Unknown';
}

export function formatMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}

export function formatMonthYear(month: number, year: number): string {
  return `${formatMonthName(month)} ${year}`;
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
    return '0 days';
  }

  const days = totalMinutes / (60 * 24);
  if (days < 1) {
    return '< 1 day';
  }

  const rounded = Math.round(days);
  return `${rounded} ${rounded === 1 ? 'day' : 'days'}`;
}

export function formatAverageStarRating(value: number | null | undefined): string {
  if (value == null) {
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

export function formatIsoWeekLabel(year: number, week: number): string {
  return `Week ${week}, ${year}`;
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

const MOVIE_DNA_DISPLAY_ARCHETYPE_BY_CODE: Record<string, string> = {
  recent_releases: 'New Release Explorer',
  series_first: 'Series Devotee',
  movie_first: 'Story Seeker',
};

const MOVIE_DNA_DISPLAY_CODE_PRIORITY = [
  'recent_releases',
  'series_first',
  'movie_first',
  'top_genre',
] as const;

const MOVIE_DNA_GENRE_ONLY_ARCHETYPE = 'Storyteller';
const MOVIE_DNA_DEFAULT_DISPLAY_TITLE = 'The Explorer';
const MIN_TITLES_FOR_DISPLAY_TITLE = 5;

function getTopGenreName(movieDna: InsightsV3MovieDna): string | null {
  const fromGenres = movieDna.topGenres[0]?.name;
  if (fromGenres) {
    return fromGenres;
  }

  const genreLabel = movieDna.labels.find((label) => label.code === 'top_genre');
  return genreLabel?.label ?? null;
}

function formatMovieDnaDisplayTitleFallback(movieDna: InsightsV3MovieDna): string {
  const { movieTitleCount, seriesTitleCount, movieSharePercent, seriesSharePercent } =
    movieDna.watchingMix;
  const totalTitles = movieTitleCount + seriesTitleCount;

  if (totalTitles < MIN_TITLES_FOR_DISPLAY_TITLE) {
    return MOVIE_DNA_DEFAULT_DISPLAY_TITLE;
  }

  if (seriesSharePercent >= 60) {
    return 'The Series Devotee';
  }

  if (movieSharePercent >= 60) {
    return 'The Story Seeker';
  }

  if (movieSharePercent >= 35 && seriesSharePercent >= 35) {
    return 'The Balanced Viewer';
  }

  const topGenreName = getTopGenreName(movieDna);
  if (topGenreName) {
    return `The ${topGenreName} ${MOVIE_DNA_GENRE_ONLY_ARCHETYPE}`;
  }

  return MOVIE_DNA_DEFAULT_DISPLAY_TITLE;
}

export function formatMovieDnaDisplayTitle(movieDna: InsightsV3MovieDna): string {
  const topGenreName = getTopGenreName(movieDna);
  const hasTopGenre = movieDna.identityCodes.includes('top_genre') && topGenreName != null;
  const primaryCode = MOVIE_DNA_DISPLAY_CODE_PRIORITY.find(
    (code) => code !== 'top_genre' && movieDna.identityCodes.includes(code),
  );

  if (hasTopGenre && primaryCode) {
    return `The ${topGenreName} ${MOVIE_DNA_DISPLAY_ARCHETYPE_BY_CODE[primaryCode]}`;
  }

  if (primaryCode) {
    return `The ${MOVIE_DNA_DISPLAY_ARCHETYPE_BY_CODE[primaryCode]}`;
  }

  if (hasTopGenre) {
    return `The ${topGenreName} ${MOVIE_DNA_GENRE_ONLY_ARCHETYPE}`;
  }

  return formatMovieDnaDisplayTitleFallback(movieDna);
}

const MOVIE_DNA_EDITORIAL_BY_CODE: Record<string, string> = {
  recent_releases: 'You keep one eye on what is still unfolding on screen.',
  series_first: 'The long arc is where your story keeps returning.',
  movie_first: 'You chase complete stories in a single sitting.',
  top_genre: 'One current runs strong beneath everything you watch.',
};

const MOVIE_DNA_EDITORIAL_CODE_PRIORITY = [
  'recent_releases',
  'series_first',
  'movie_first',
  'top_genre',
] as const;

const MIN_TITLES_FOR_EDITORIAL = 5;

export function formatMovieDnaEditorialLine(movieDna: InsightsV3MovieDna): string {
  for (const code of MOVIE_DNA_EDITORIAL_CODE_PRIORITY) {
    if (movieDna.identityCodes.includes(code)) {
      return MOVIE_DNA_EDITORIAL_BY_CODE[code];
    }
  }

  const { movieTitleCount, seriesTitleCount, movieSharePercent, seriesSharePercent } =
    movieDna.watchingMix;
  const totalTitles = movieTitleCount + seriesTitleCount;

  if (totalTitles < MIN_TITLES_FOR_EDITORIAL) {
    return 'Your reel is still finding its signature.';
  }

  if (movieSharePercent >= 35 && seriesSharePercent >= 35) {
    return 'You move freely between the epic and the episode.';
  }

  if (seriesSharePercent >= 60) {
    return 'You follow worlds that deepen with every chapter.';
  }

  if (movieSharePercent >= 60) {
    return 'A single sitting still holds your full attention.';
  }

  const topShare = movieDna.topGenres[0]?.sharePercent ?? 0;
  if (topShare >= 25) {
    return 'Your instincts keep circling the same kind of magic.';
  }

  return 'Every watch leaves another clue on the reel.';
}

export function formatGenreGravitation(genreNames: string[]): string | null {
  if (genreNames.length === 0) {
    return null;
  }

  if (genreNames.length === 1) {
    return `You gravitate toward ${genreNames[0]}.`;
  }

  if (genreNames.length === 2) {
    return `You gravitate toward ${genreNames[0]} and ${genreNames[1]}.`;
  }

  const last = genreNames[genreNames.length - 1];
  const rest = genreNames.slice(0, -1).join(', ');
  return `You gravitate toward ${rest} and ${last}.`;
}

export function formatDominantGenreHeadline(genreName: string): string {
  return `${genreName} dominates your library`;
}

export function formatDecadeLabel(bucket: string): string {
  return bucket;
}

export function formatHoursShort(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return '0h';
  }

  const hours = Math.round(totalMinutes / 60);
  return `${hours}h`;
}

export function formatAchievementBadgeNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatAchievementCategoryLabel(category: string): string {
  switch (category) {
    case 'movies':
      return 'Movies';
    case 'episodes':
      return 'Episodes';
    case 'ratings':
      return 'Ratings';
    case 'shows':
      return 'Series';
    case 'genres':
      return 'Genres';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
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
