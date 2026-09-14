export function movieWatchProvidersQueryKey(movieId: string, region: string) {
  return ['movie', movieId, 'watch-providers', region] as const;
}

export function tvWatchProvidersQueryKey(tvShowId: string, region: string) {
  return ['tv', tvShowId, 'watch-providers', region] as const;
}
