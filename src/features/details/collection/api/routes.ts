function encodePathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function buildCollectionDetailsPath(tmdbCollectionId: number): string {
  return `/api/collections/${encodePathSegment(tmdbCollectionId)}`;
}
