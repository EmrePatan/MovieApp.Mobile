function encodePathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function buildPersonDetailsPath(tmdbId: number): string {
  return `/api/people/tmdb/${encodePathSegment(tmdbId)}`;
}
