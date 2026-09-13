import { useEffect, useRef, useState } from 'react';
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
      previousWatchedRef.current = watchedEpisodes;
      return;
    }

    const previousWatched = previousWatchedRef.current;

    if (
      shouldTriggerShowCompletionCelebration(previousWatched, watchedEpisodes, totalEpisodes)
    ) {
      setConfettiVisible(true);
    }

    previousWatchedRef.current = watchedEpisodes;
  }, [enabled, totalEpisodes, watchedEpisodes]);

  const dismissConfetti = () => {
    setConfettiVisible(false);
  };

  return { confettiVisible, dismissConfetti };
}
