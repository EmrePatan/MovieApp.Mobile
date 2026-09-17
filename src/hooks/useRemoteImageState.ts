import { useState } from 'react';

export type RemoteImageState = 'idle' | 'loading' | 'loaded' | 'error';

export function getInitialState(uri: string | null | undefined): RemoteImageState {
  return uri ? 'loading' : 'error';
}

export function useRemoteImageState(uri: string | null | undefined) {
  const [trackedUri, setTrackedUri] = useState(uri);
  const [state, setState] = useState<RemoteImageState>(() => getInitialState(uri));

  if (trackedUri !== uri) {
    setTrackedUri(uri);
    setState(getInitialState(uri));
  }

  return {
    state,
    isLoading: state === 'loading',
    showFallback: !uri || state === 'error',
    markLoading: () => setState('loading'),
    markLoaded: () => setState('loaded'),
    markError: () => setState('error'),
  };
}
