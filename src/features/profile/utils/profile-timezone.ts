export function getProfileStatisticsTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
