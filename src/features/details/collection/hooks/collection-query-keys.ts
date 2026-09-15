export function collectionDetailsQueryKey(tmdbCollectionId: number) {
  return ['collection', tmdbCollectionId] as const;
}
