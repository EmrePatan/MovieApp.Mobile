export function parseIsoDateOnly(value: string): Date | null {
  const datePart = value.slice(0, 10);
  const date = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function getTodayDateOnly(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isFutureReleaseDate(releaseDate: string | null | undefined): boolean {
  if (!releaseDate) {
    return false;
  }

  const parsed = parseIsoDateOnly(releaseDate);
  if (!parsed) {
    return false;
  }

  return parsed.getTime() > getTodayDateOnly().getTime();
}

function getDayDifference(target: Date, today: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

export function formatRelativeAirDate(releaseDate: string | null | undefined): string | null {
  if (!releaseDate) {
    return null;
  }

  const parsed = parseIsoDateOnly(releaseDate);
  if (!parsed) {
    return null;
  }

  const today = getTodayDateOnly();
  const dayDiff = getDayDifference(parsed, today);

  if (dayDiff === 0) {
    return 'Today';
  }

  if (dayDiff === 1) {
    return 'Tomorrow';
  }

  if (dayDiff > 1) {
    return `in ${dayDiff} days`;
  }

  return null;
}
