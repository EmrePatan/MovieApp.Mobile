import { useCallback, useEffect, useRef, useState } from 'react';

export type RemoteImageState = 'idle' | 'loading' | 'loaded' | 'error';

export const REMOTE_IMAGE_LOAD_TIMEOUT_MS = 10_000;

export function getInitialState(uri: string | null | undefined): RemoteImageState {
  return uri ? 'loading' : 'error';
}

export function useRemoteImageState(uri: string | null | undefined) {
  const [trackedUri, setTrackedUri] = useState(uri);
  const [state, setState] = useState<RemoteImageState>(() => getInitialState(uri));
  const requestIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const clearLoadingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleLoadingTimeout = useCallback(() => {
    clearLoadingTimeout();

    if (!uri) {
      return;
    }

    const requestId = requestIdRef.current;
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current || requestIdRef.current !== requestId) {
        return;
      }

      setState('error');
    }, REMOTE_IMAGE_LOAD_TIMEOUT_MS);
  }, [clearLoadingTimeout, uri]);

  const beginLoading = useCallback(() => {
    requestIdRef.current += 1;
    setState('loading');
    scheduleLoadingTimeout();
  }, [scheduleLoadingTimeout]);

  const completeLoading = useCallback(
    (nextState: 'loaded' | 'error') => {
      requestIdRef.current += 1;
      clearLoadingTimeout();
      setState(nextState);
    },
    [clearLoadingTimeout],
  );

  if (trackedUri !== uri) {
    requestIdRef.current += 1;
    clearLoadingTimeout();
    setTrackedUri(uri);
    setState(getInitialState(uri));
  }

  useEffect(() => {
    isMountedRef.current = true;

    if (uri && state === 'loading') {
      scheduleLoadingTimeout();
    }

    return () => {
      isMountedRef.current = false;
      clearLoadingTimeout();
    };
  }, [clearLoadingTimeout, scheduleLoadingTimeout, state, uri]);

  return {
    state,
    isLoading: state === 'loading',
    showFallback: !uri || state === 'error',
    markLoading: beginLoading,
    markLoaded: () => completeLoading('loaded'),
    markError: () => completeLoading('error'),
  };
}
