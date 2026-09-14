export function buildTvShowFollowStatusPath(tvShowId: string): string {
  return `/api/tvshows/${tvShowId}/follow`;
}

export function buildPushDevicesPath(): string {
  return '/api/push-devices';
}
