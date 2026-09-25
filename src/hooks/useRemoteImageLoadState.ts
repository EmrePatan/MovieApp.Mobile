import { useCallback, useRef, useState } from 'react';

type RemoteImageLoadState = {
  hasError: boolean;
  retryVersion: number;
};

const INITIAL_LOAD_STATE: RemoteImageLoadState = {
  hasError: false,
  retryVersion: 0,
};

/**
 * Tracks remote image load failures with a single transparent retry.
 * Resets when the resolved source identity changes.
 * Ignores stale onError callbacks from recycled or remounted Image instances.
 */
export function useRemoteImageLoadState(sourceKey: string | null | undefined) {
  const generationRef = useRef(0);
  const loadedRef = useRef(false);
  const failedAttemptRef = useRef<string | null>(null);
  const normalizedKey = sourceKey ?? '';
  const [trackedKey, setTrackedKey] = useState(normalizedKey);
  const [loadState, setLoadState] = useState<RemoteImageLoadState>(INITIAL_LOAD_STATE);

  if (trackedKey !== normalizedKey) {
    setTrackedKey(normalizedKey);
    setLoadState(INITIAL_LOAD_STATE);
    loadedRef.current = false;
    generationRef.current += 1;
  }

  const generation = generationRef.current;
  const { hasError, retryVersion } = loadState;
  const attemptId = `${normalizedKey}:${retryVersion}`;

  const onImageLoad = useCallback(() => {
    if (generationRef.current !== generation) {
      return;
    }

    loadedRef.current = true;
  }, [generation]);

  const onImageLoadEnd = useCallback(() => {
    // React Native emits onLoadEnd after both success and failure.
    // A failed attempt must not be recorded as loaded, or the retry's onError is ignored.
    if (generationRef.current !== generation || failedAttemptRef.current === attemptId) {
      return;
    }

    loadedRef.current = true;
  }, [attemptId, generation]);

  const onImageError = useCallback(() => {
    if (loadedRef.current || generationRef.current !== generation) {
      return;
    }

    failedAttemptRef.current = attemptId;
    const generationAtError = generation;
    const retryAtError = retryVersion;

    setLoadState((current) => {
      if (generationRef.current !== generationAtError) {
        return current;
      }

      if (current.retryVersion !== retryAtError) {
        return current;
      }

      if (current.retryVersion < 1) {
        loadedRef.current = false;
        return { ...current, retryVersion: current.retryVersion + 1 };
      }

      return { ...current, hasError: true };
    });
  }, [attemptId, generation, retryVersion]);

  return {
    hasError,
    imageKey: `${normalizedKey}:${retryVersion}`,
    onImageError,
    onImageLoad,
    onImageLoadEnd,
  };
}
