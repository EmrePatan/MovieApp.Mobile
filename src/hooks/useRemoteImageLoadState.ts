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
  const [trackedKey, setTrackedKey] = useState(sourceKey);
  const [loadState, setLoadState] = useState<RemoteImageLoadState>(INITIAL_LOAD_STATE);

  if (trackedKey !== sourceKey) {
    setTrackedKey(sourceKey);
    setLoadState(INITIAL_LOAD_STATE);
    generationRef.current += 1;
  }

  const generation = generationRef.current;
  const { hasError, retryVersion } = loadState;

  const onImageError = useCallback(() => {
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
        return { ...current, retryVersion: current.retryVersion + 1 };
      }

      return { ...current, hasError: true };
    });
  }, [generation, retryVersion]);

  return {
    hasError,
    imageKey: `${sourceKey ?? ''}:${retryVersion}`,
    onImageError,
  };
}
