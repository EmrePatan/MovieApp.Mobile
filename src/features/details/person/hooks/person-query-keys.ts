export function personDetailsQueryKey(tmdbId: number) {
  return ['person', tmdbId] as const;
}
