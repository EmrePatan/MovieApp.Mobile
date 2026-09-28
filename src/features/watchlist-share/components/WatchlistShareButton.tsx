import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Share } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { buildWatchlistShareMessage } from '../build-watchlist-share-message';
import {
  getStoredWatchlistShareUrl,
  useWatchlistShareMutations,
  useWatchlistShareStatus,
} from '../hooks/useWatchlistShare';

type WatchlistShareButtonAppearance = 'icon' | 'row';

interface WatchlistShareButtonProps {
  isAuthenticated: boolean;
  watchlistId: string | null;
  appearance?: WatchlistShareButtonAppearance;
}

export function WatchlistShareButton({
  isAuthenticated,
  watchlistId,
  appearance = 'icon',
}: WatchlistShareButtonProps) {
  const { t } = useTranslation();
  const statusQuery = useWatchlistShareStatus(isAuthenticated);
  const { enable, disable, rotate } = useWatchlistShareMutations();

  const shareUrl = useCallback(async (): Promise<string | null> => {
    if (!watchlistId) {
      return null;
    }

    const stored = await getStoredWatchlistShareUrl();
    if (stored) {
      return stored;
    }

    const enabled = await enable.mutateAsync(watchlistId);
    return enabled.shareUrl;
  }, [enable, watchlistId]);

  const openShareSheet = useCallback(
    async (url: string) => {
      const message = buildWatchlistShareMessage(url, t);
      await Share.share({ message, title: t('common.watchlist') });
    },
    [t],
  );

  const handlePress = useCallback(() => {
    if (!watchlistId) {
      return;
    }

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
              const rotated = await rotate.mutateAsync(watchlistId);
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
  }, [disable, openShareSheet, rotate, shareUrl, statusQuery.data?.isSharingEnabled, t, watchlistId]);

  if (!isAuthenticated || !watchlistId) {
    return null;
  }

  const shareAccessibilityLabel = t('watchlistShare.shareThisList');

  if (appearance === 'row') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={shareAccessibilityLabel}
        onPress={handlePress}
        style={({ pressed }) => [styles.rowAction, pressed && styles.pressed]}
      >
        <Ionicons name="share-outline" size={17} color={colors.textSecondary} />
        <AppText variant="caption" numberOfLines={1} style={styles.rowLabel}>
          {t('watchlistShare.shareRow')}
        </AppText>
      </Pressable>
    );
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
  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
