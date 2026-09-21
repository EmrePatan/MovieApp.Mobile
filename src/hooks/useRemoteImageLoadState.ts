import { useCallback, useState } from 'react';

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
 */
export function useRemoteImageLoadState(sourceKey: string | null | undefined) {
  const [trackedKey, setTrackedKey] = useState(sourceKey);
  const [loadState, setLoadState] = useState<RemoteImageLoadState>(INITIAL_LOAD_STATE);

  if (trackedKey !== sourceKey) {
    setTrackedKey(sourceKey);
    setLoadState(INITIAL_LOAD_STATE);
  }

  const handleError = useCallback(() => {
    setLoadState((current) => {
      if (current.retryVersion < 1) {
        return { ...current, retryVersion: current.retryVersion + 1 };
      }

      return { ...current, hasError: true };
    });
  }, []);

  return {
    hasError: loadState.hasError,
    imageKey: `${sourceKey ?? ''}:${loadState.retryVersion}`,
    handleError,
  };
}
