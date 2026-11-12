import { useCallback, useEffect, useRef, useState } from 'react';
import { shouldTriggerShowCompletionCelebration } from '../utils/show-completion-celebration';

interface UseShowCompletionCelebrationOptions {
  isCompleted: boolean;
  enabled: boolean;
  onCompleted?: () => void;
}

export function useShowCompletionCelebration({
  isCompleted,
  enabled,
  onCompleted,
}: UseShowCompletionCelebrationOptions) {
  const previousCompletedRef = useRef<boolean | null>(null);
  const [confettiVisible, setConfettiVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      previousCompletedRef.current = null;
      return;
    }

    if (shouldTriggerShowCompletionCelebration(previousCompletedRef.current, isCompleted)) {
      setConfettiVisible(true);
      onCompleted?.();
    }

    previousCompletedRef.current = isCompleted;
  }, [enabled, isCompleted, onCompleted]);

  const dismissConfetti = useCallback(() => {
    setConfettiVisible(false);
  }, []);

  return { confettiVisible, dismissConfetti };
}
