type CelebrationListener = (tvShowId: string) => void;

const listeners = new Set<CelebrationListener>();

/** Explicitly request confetti + post-dismiss rating for a TV show completion. */
export function requestTvShowCompletionCelebration(tvShowId: string): void {
  if (!tvShowId) {
    return;
  }

  listeners.forEach((listener) => listener(tvShowId));
}

export function subscribeTvShowCompletionCelebration(listener: CelebrationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
