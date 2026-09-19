import { useCallback, useEffect, useRef, useState } from 'react';
import { shouldTriggerShowCompletionCelebration } from '../utils/show-completion-celebration';

interface UseShowCompletionCelebrationOptions {
  watchedEpisodes: number;
  totalEpisodes: number;
  enabled: boolean;
}

export function useShowCompletionCelebration({
  watchedEpisodes,
  totalEpisodes,
  enabled,
}: UseShowCompletionCelebrationOptions) {
  const previousWatchedRef = useRef<number | null>(null);
  const [confettiVisible, setConfettiVisible] = useState(false);

  useEffect(() => {
    if (!enabled || totalEpisodes <= 0) {
      if (!enabled) {
        previousWatchedRef.current = null;
      }

      return;
    }

    const previousWatched = previousWatchedRef.current;

    if (previousWatched === null) {
      previousWatchedRef.current = watchedEpisodes;
      return;
    }

    if (
      shouldTriggerShowCompletionCelebration(previousWatched, watchedEpisodes, totalEpisodes)
    ) {
      setConfettiVisible(true);
    }

    previousWatchedRef.current = watchedEpisodes;
  }, [enabled, totalEpisodes, watchedEpisodes]);

  const dismissConfetti = useCallback(() => {
    setConfettiVisible(false);
  }, []);

  return { confettiVisible, dismissConfetti };
}
