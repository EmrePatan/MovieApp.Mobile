export function tvShowFollowStatusQueryKey(tvShowId: string): readonly ['tv-show-follow-status', string] {
  return ['tv-show-follow-status', tvShowId];
}

export function movieFollowStatusQueryKey(movieId: string): readonly ['movie-follow-status', string] {
  return ['movie-follow-status', movieId];
}
