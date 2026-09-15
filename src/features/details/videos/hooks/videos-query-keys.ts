export function movieVideosQueryKey(movieId: string) {
  return ['movie', movieId, 'videos'] as const;
}

export function tvVideosQueryKey(tvShowId: string) {
  return ['tvshow', tvShowId, 'videos'] as const;
}
