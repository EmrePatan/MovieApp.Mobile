import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Share } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { buildWatchlistShareMessage } from '../build-watchlist-share-message';
import {
  getStoredWatchlistShareUrl,
  useWatchlistShareMutations,
  useWatchlistShareStatus,
} from '../hooks/useWatchlistShare';

interface WatchlistShareButtonProps {
  isAuthenticated: boolean;
}

export function WatchlistShareButton({ isAuthenticated }: WatchlistShareButtonProps) {
  const { t } = useTranslation();
  const statusQuery = useWatchlistShareStatus(isAuthenticated);
  const { enable, disable, rotate } = useWatchlistShareMutations();

  const shareUrl = useCallback(async (): Promise<string | null> => {
    const stored = await getStoredWatchlistShareUrl();
    if (stored) {
      return stored;
    }

    const enabled = await enable.mutateAsync();
    return enabled.shareUrl;
  }, [enable]);

  const openShareSheet = useCallback(
    async (url: string) => {
      const message = buildWatchlistShareMessage(url, t);
      await Share.share({ message, title: t('common.watchlist') });
    },
    [t],
  );

  const handlePress = useCallback(() => {
    void (async () => {
      if (!statusQuery.data?.isSharingEnabled) {
        const url = await shareUrl();
        if (!url) {
          Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
          return;
        }

        await openShareSheet(url);
        return;
      }

      const currentUrl = await getStoredWatchlistShareUrl();
      Alert.alert(t('watchlistShare.manageTitle'), undefined, [
        {
          text: t('watchlistShare.shareLink'),
          onPress: () => {
            void (async () => {
              const url = currentUrl ?? (await shareUrl());
              if (url) {
                await openShareSheet(url);
              }
            })();
          },
        },
        {
          text: t('watchlistShare.createNewLink'),
          onPress: () => {
            void (async () => {
              const rotated = await rotate.mutateAsync();
              await openShareSheet(rotated.shareUrl);
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
  }, [disable, openShareSheet, rotate, shareUrl, statusQuery.data?.isSharingEnabled, t]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('watchlistShare.shareButton')}
      onPress={handlePress}
      style={styles.button}
    >
      <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.xs,
  },
});
