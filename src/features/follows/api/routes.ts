export function buildTvShowFollowStatusPath(tvShowId: string): string {
  return `/api/tvshows/${tvShowId}/follow`;
}

export function buildMovieFollowStatusPath(movieId: string): string {
  return `/api/movies/${movieId}/follow`;
}

export function buildPushDevicesPath(): string {
  return '/api/push-devices';
}
