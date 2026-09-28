import { useCallback } from 'react';
import { Alert, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { buildWatchlistShareMessage } from '../build-watchlist-share-message';
import { getStoredWatchlistShareUrl, useWatchlistShareMutations } from './useWatchlistShare';

export function useWatchlistShareController(
  watchlistId: string | null,
  isAuthenticated: boolean,
) {
  const { t } = useTranslation();
  const { enable } = useWatchlistShareMutations(watchlistId);

  const showShareError = useCallback(() => {
    Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
  }, [t]);

  const showLinkRecoveryHint = useCallback(() => {
    Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.linkRecoveryHint'));
  }, [t]);

  const openNativeShare = useCallback(
    async (url: string) => {
      const message = buildWatchlistShareMessage(url, t);
      await Share.share({ message, title: t('common.watchlist') });
    },
    [t],
  );

  const resolveShareUrl = useCallback(async (): Promise<string | null> => {
    if (!watchlistId) {
      return null;
    }

    const stored = await getStoredWatchlistShareUrl(watchlistId);
    if (stored) {
      return stored;
    }

    try {
      const enabled = await enable.mutateAsync();
      if (enabled.shareUrl) {
        return enabled.shareUrl;
      }

      const storedAfterEnable = await getStoredWatchlistShareUrl(watchlistId);
      if (storedAfterEnable) {
        return storedAfterEnable;
      }

      showLinkRecoveryHint();
      return null;
    } catch {
      showShareError();
      return null;
    }
  }, [enable, showLinkRecoveryHint, showShareError, watchlistId]);

  const startShare = useCallback(() => {
    if (!watchlistId || !isAuthenticated) {
      return;
    }

    void (async () => {
      const url = await resolveShareUrl();
      if (!url) {
        return;
      }

      await openNativeShare(url);
    })();
  }, [isAuthenticated, openNativeShare, resolveShareUrl, watchlistId]);

  return { startShare, resolveShareUrl, openNativeShare };
}
