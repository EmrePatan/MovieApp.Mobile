export function buildInsightsSummaryPath(timeZone: string): string {
  const params = new URLSearchParams({ timeZone });
  return `/api/insights/summary?${params.toString()}`;
}

export function buildInsightsAnalyticsPath(timeZone: string): string {
  const params = new URLSearchParams({ timeZone });
  return `/api/insights/analytics?${params.toString()}`;
}
