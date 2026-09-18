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

export function formatHoursShort(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return '0h';
  }

  const hours = Math.round(totalMinutes / 60);
  return `${hours}h`;
}
