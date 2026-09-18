export function buildInsightsV3Path(timeZone: string, year?: number): string {
  const params = new URLSearchParams({ timeZone });
  if (year !== undefined) {
    params.set('year', String(year));
  }

  return `/api/insights/v3?${params.toString()}`;
}
