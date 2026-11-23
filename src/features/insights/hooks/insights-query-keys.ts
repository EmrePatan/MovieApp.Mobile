export function insightsCompareQueryKey(userId: string, timeZone: string) {
  return ['insights', 'compare', userId, timeZone] as const;
}

export function insightsV3QueryKey(timeZone: string, year?: number) {
  return ['insights', 'v3', timeZone, year ?? 'current'] as const;
}
