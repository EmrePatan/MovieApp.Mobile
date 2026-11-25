export function formatWatchDuration(
  totalMinutes: number,
  labels: {
    minutes: (count: number) => string;
    hours: (count: number) => string;
    hoursMinutes: (hours: number, minutes: number) => string;
    days: (count: number) => string;
    daysHours: (days: number, hours: number) => string;
  },
): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '—';
  const minutes = Math.round(totalMinutes);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  const remMinutes = minutes % 60;
  if (days >= 1) {
    return remHours > 0 ? labels.daysHours(days, remHours) : labels.days(days);
  }
  if (hours >= 1) {
    return remMinutes > 0 ? labels.hoursMinutes(hours, remMinutes) : labels.hours(hours);
  }
  return labels.minutes(minutes);
}
