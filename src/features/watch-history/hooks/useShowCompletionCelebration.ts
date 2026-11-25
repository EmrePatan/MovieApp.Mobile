import { useCallback, useEffect, useRef, useState } from 'react';
import { shouldTriggerShowCompletionCelebration } from '../utils/show-completion-celebration';

interface UseShowCompletionCelebrationOptions {
  isCompleted: boolean;
  enabled: boolean;
  onCompleted?: () => void;
  /** Increment to force confetti (e.g. bulk İzledim) even when the false→true edge was missed. */
  forceToken?: number;
}

export function useShowCompletionCelebration({
  isCompleted,
  enabled,
  onCompleted,
  forceToken = 0,
}: UseShowCompletionCelebrationOptions) {
  const previousCompletedRef = useRef<boolean | null>(null);
  const pendingCompletionCallbackRef = useRef(false);
  const onCompletedRef = useRef(onCompleted);
  const lastForceTokenRef = useRef(0);
  const [confettiVisible, setConfettiVisible] = useState(false);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
  }, [onCompleted]);

  const beginCelebration = useCallback(() => {
    pendingCompletionCallbackRef.current = true;
    setConfettiVisible(true);
  }, []);

  useEffect(() => {
    if (!enabled) {
      previousCompletedRef.current = null;
      return;
    }

    if (shouldTriggerShowCompletionCelebration(previousCompletedRef.current, isCompleted)) {
      beginCelebration();
    }

    previousCompletedRef.current = isCompleted;
  }, [beginCelebration, enabled, isCompleted]);

  useEffect(() => {
    if (!enabled || forceToken <= 0 || forceToken === lastForceTokenRef.current) {
      return;
    }

    lastForceTokenRef.current = forceToken;
    previousCompletedRef.current = true;
    beginCelebration();
  }, [beginCelebration, enabled, forceToken]);

  const dismissConfetti = useCallback(() => {
    setConfettiVisible(false);
    if (!pendingCompletionCallbackRef.current) {
      return;
    }

    pendingCompletionCallbackRef.current = false;
    onCompletedRef.current?.();
  }, []);

  return { confettiVisible, dismissConfetti };
}
