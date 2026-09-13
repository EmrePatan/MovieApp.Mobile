export function shouldTriggerShowCompletionCelebration(
  previousWatched: number | null,
  watchedEpisodes: number,
  totalEpisodes: number,
): boolean {
  if (totalEpisodes <= 0) {
    return false;
  }

  if (previousWatched === null) {
    return false;
  }

  return previousWatched < totalEpisodes && watchedEpisodes >= totalEpisodes;
}

export function isShowFullyWatched(watchedEpisodes: number, totalEpisodes: number): boolean {
  return totalEpisodes > 0 && watchedEpisodes >= totalEpisodes;
}
