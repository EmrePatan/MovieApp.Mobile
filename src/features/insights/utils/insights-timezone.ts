export function getInsightsTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
