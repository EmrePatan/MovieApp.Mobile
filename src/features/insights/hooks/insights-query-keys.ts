export function insightsV3QueryKey(timeZone: string, year?: number) {
  return ['insights', 'v3', timeZone, year ?? 'current'] as const;
}
