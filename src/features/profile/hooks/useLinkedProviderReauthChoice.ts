import { useCallback, useRef, useState } from 'react';
import type { SocialAuthProvider } from '@/models/api/auth';
import type { LinkedProviderChoiceHandler } from '../utils/linked-provider-reauth';

export function useLinkedProviderReauthChoice() {
  const [pendingProviders, setPendingProviders] = useState<SocialAuthProvider[] | null>(null);
  const resolverRef = useRef<((provider: SocialAuthProvider | null) => void) | null>(null);

  const chooseProvider = useCallback<LinkedProviderChoiceHandler>(async (providers) => {
    if (providers.length <= 1) {
      return providers[0] ?? null;
    }

    return await new Promise<SocialAuthProvider | null>((resolve) => {
      resolverRef.current = resolve;
      setPendingProviders([...providers]);
    });
  }, []);

  const selectProvider = useCallback((provider: SocialAuthProvider) => {
    setPendingProviders(null);
    resolverRef.current?.(provider);
    resolverRef.current = null;
  }, []);

  const cancelChoice = useCallback(() => {
    setPendingProviders(null);
    resolverRef.current?.(null);
    resolverRef.current = null;
  }, []);

  return {
    pendingProviders,
    chooseProvider,
    selectProvider,
    cancelChoice,
  };
}
