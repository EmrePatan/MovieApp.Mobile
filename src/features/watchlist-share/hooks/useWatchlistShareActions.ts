import { useCallback } from 'react';
import { Alert, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { buildWatchlistShareMessage } from '../build-watchlist-share-message';
import { pickWatchlistShareUrl } from '../pick-watchlist-share-url';
import { waitForShareSheetHost } from '../wait-for-share-sheet-host';
import {
  getStoredWatchlistShareUrl,
  useWatchlistShareMutations,
  useWatchlistShareStatus,
} from './useWatchlistShare';

export function useWatchlistShareActions(
  watchlistId: string | null,
  isAuthenticated: boolean,
) {
  const { t } = useTranslation();
  const statusQuery = useWatchlistShareStatus(watchlistId, isAuthenticated);
  const { enable, disable, rotate } = useWatchlistShareMutations(watchlistId);

  const openShareSheet = useCallback(
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

    const enabled = await enable.mutateAsync();
    const enabledUrl = pickWatchlistShareUrl(enabled);
    if (enabledUrl) {
      return enabledUrl;
    }

    try {
      const rotated = await rotate.mutateAsync();
      return pickWatchlistShareUrl(rotated);
    } catch {
      return null;
    }
  }, [enable, rotate, watchlistId]);

  const showManageShareAlert = useCallback(() => {
    if (!watchlistId) {
      return;
    }

    void (async () => {
      const currentUrl = await getStoredWatchlistShareUrl(watchlistId);

      Alert.alert(t('watchlistShare.manageTitle'), undefined, [
        {
          text: t('watchlistShare.shareLink'),
          onPress: () => {
            void (async () => {
              const url = currentUrl ?? (await resolveShareUrl());
              if (url) {
                await openShareSheet(url);
              } else {
                Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
              }
            })();
          },
        },
        {
          text: t('watchlistShare.createNewLink'),
          onPress: () => {
            void (async () => {
              try {
                const rotated = await rotate.mutateAsync();
                const url = pickWatchlistShareUrl(rotated);
                if (url) {
                  await openShareSheet(url);
                }
              } catch {
                Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
              }
            })();
          },
        },
        {
          text: t('watchlistShare.disableSharing'),
          style: 'destructive',
          onPress: () => {
            void disable.mutateAsync();
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    })();
  }, [disable, openShareSheet, resolveShareUrl, rotate, t, watchlistId]);

  const presentShareFlow = useCallback(async () => {
    if (!watchlistId || !isAuthenticated) {
      return;
    }

    if (!statusQuery.data?.isSharingEnabled) {
      const url = await resolveShareUrl();
      if (!url) {
        Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
        return;
      }

      await openShareSheet(url);
      return;
    }

    showManageShareAlert();
  }, [
    isAuthenticated,
    openShareSheet,
    resolveShareUrl,
    showManageShareAlert,
    statusQuery.data?.isSharingEnabled,
    t,
    watchlistId,
  ]);

  /** Called after the list options sheet starts closing. */
  const presentFromListOptions = useCallback(() => {
    if (!watchlistId || !isAuthenticated) {
      return;
    }

    void (async () => {
      await waitForShareSheetHost();
      await presentShareFlow();
    })();
  }, [isAuthenticated, presentShareFlow, watchlistId]);

  return { presentFromListOptions, presentShareFlow };
}
