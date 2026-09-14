export function movieCreditsQueryKey(movieId: string) {
  return ['movie', movieId, 'credits'] as const;
}

export function tvCreditsQueryKey(tvShowId: string) {
  return ['tv', tvShowId, 'credits'] as const;
}
