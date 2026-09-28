import { useCallback } from 'react';
import { Alert, InteractionManager, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { buildWatchlistShareMessage } from '../build-watchlist-share-message';
import { getStoredWatchlistShareUrl, useWatchlistShareMutations } from './useWatchlistShare';

export function useWatchlistShareController(
  watchlistId: string | null,
  isAuthenticated: boolean,
) {
  const { t } = useTranslation();
  const { enable, rotate } = useWatchlistShareMutations(watchlistId);

  const showShareError = useCallback(() => {
    Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
  }, [t]);

  const showLinkRecoveryHint = useCallback(() => {
    Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.linkRecoveryHint'));
  }, [t]);

  const openNativeShare = useCallback(
    async (url: string) => {
      const message = buildWatchlistShareMessage(url, t);
      try {
        await Share.share({ message, title: t('common.watchlist') });
      } catch {
        showShareError();
      }
    },
    [showShareError, t],
  );

  const waitForShareSheetHost = useCallback(
    () =>
      new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(resolve, 320);
        });
      }),
    [],
  );

  const recoverShareUrlViaRotate = useCallback(async (): Promise<string | null> => {
    try {
      const rotated = await rotate.mutateAsync();
      return rotated.shareUrl || null;
    } catch {
      return null;
    }
  }, [rotate]);

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

      // Sharing may already be enabled (POST returns empty URL). Profile screen uses rotate here.
      const rotatedUrl = await recoverShareUrlViaRotate();
      if (rotatedUrl) {
        return rotatedUrl;
      }

      showLinkRecoveryHint();
      return null;
    } catch {
      const rotatedUrl = await recoverShareUrlViaRotate();
      if (rotatedUrl) {
        return rotatedUrl;
      }

      showShareError();
      return null;
    }
  }, [
    enable,
    recoverShareUrlViaRotate,
    showLinkRecoveryHint,
    showShareError,
    watchlistId,
  ]);

  const startShare = useCallback(() => {
    if (!watchlistId || !isAuthenticated) {
      return;
    }

    void (async () => {
      const url = await resolveShareUrl();
      if (!url) {
        return;
      }

      // Options sheet is a Modal; Share.share while it dismisses often never shows the OS picker.
      await waitForShareSheetHost();
      await openNativeShare(url);
    })();
  }, [isAuthenticated, openNativeShare, resolveShareUrl, waitForShareSheetHost, watchlistId]);

  return { startShare, resolveShareUrl, openNativeShare };
}
