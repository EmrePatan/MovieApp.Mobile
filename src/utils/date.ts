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
