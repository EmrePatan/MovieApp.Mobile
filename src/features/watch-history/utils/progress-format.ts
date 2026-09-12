export function formatWatchProgressLabel(
  watchedEpisodes: number,
  totalEpisodes: number,
): string {
  return `${watchedEpisodes} / ${totalEpisodes} episodes watched`;
}

export function formatProgressPercentage(progressPercentage: number): string {
  return `${progressPercentage.toFixed(0)}% complete`;
}
