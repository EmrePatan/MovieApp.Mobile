import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getWatchlistShareStatus } from '../api/watchlist-share-api';
import { ensureWatchlistShareUrlForNativeSheet } from '../ensure-watchlist-share-url-for-native-sheet';
import { openNativeWatchlistShare } from '../open-native-watchlist-share';
import { waitForShareSheetHost } from '../wait-for-share-sheet-host';
import { useWatchlistShareMutations } from './useWatchlistShare';

export function useWatchlistShareController(
  watchlistId: string | null,
  isAuthenticated: boolean,
) {
  const { t } = useTranslation();
  const { enable, rotate } = useWatchlistShareMutations(watchlistId);

  const showShareError = useCallback(() => {
    Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
  }, [t]);

  const obtainShareUrlForNativeSheet = useCallback(async (): Promise<string> => {
    if (!watchlistId) {
      throw new Error('watchlist-share-missing-watchlist-id');
    }

    return ensureWatchlistShareUrlForNativeSheet(watchlistId, {
      getStatus: getWatchlistShareStatus,
      enableShare: async () => enable.mutateAsync(),
      rotateShare: async () => rotate.mutateAsync(),
    });
  }, [enable, rotate, watchlistId]);

  const startShare = useCallback(() => {
    if (!watchlistId || !isAuthenticated) {
      return;
    }

    void (async () => {
      try {
        await waitForShareSheetHost();
        const url = await obtainShareUrlForNativeSheet();
        await openNativeWatchlistShare(url, t);
      } catch {
        showShareError();
      }
    })();
  }, [isAuthenticated, obtainShareUrlForNativeSheet, showShareError, t, watchlistId]);

  const openNativeShare = useCallback(
    async (url: string) => {
      try {
        await openNativeWatchlistShare(url, t);
      } catch {
        showShareError();
      }
    },
    [showShareError, t],
  );

  return { startShare, openNativeShare, obtainShareUrlForNativeSheet };
}
