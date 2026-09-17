export function insightsSummaryQueryKey(timeZone: string) {
  return ['insights', 'summary', timeZone] as const;
}

export function insightsAnalyticsQueryKey(timeZone: string) {
  return ['insights', 'analytics', timeZone] as const;
}
