import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { EmptyView } from '@/components/common/EmptyView';
import { ErrorView } from '@/components/common/ErrorView';
import type { WatchlistShareSummaryResponse } from '../api/watchlist-share-api';
import { buildWatchlistShareMessage } from '../build-watchlist-share-message';
import {
  getStoredWatchlistShareUrl,
  useWatchlistShareMutations,
} from '../hooks/useWatchlistShare';
import {
  activeWatchlistSharesQueryKey,
  useActiveWatchlistShares,
} from '../hooks/useActiveWatchlistShares';
import { useQueryClient } from '@tanstack/react-query';
import { Share } from 'react-native';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const HORIZONTAL_INSET = spacing.lg;

export function SharedWatchlistsContent() {
  const { t } = useTranslation();
  const query = useActiveWatchlistShares();
  const queryClient = useQueryClient();
  const items = query.data?.items ?? [];

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: activeWatchlistSharesQueryKey });
  }, [queryClient]);

  if (query.isLoading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
        <AppText variant="bodySmall" muted>
          {t('common.loading')}
        </AppText>
      </View>
    );
  }

  if (query.isError && items.length === 0) {
    const message = isApiError(query.error)
      ? query.error.userMessage
      : t('common.somethingWentWrong');

    return (
      <View style={styles.centered}>
        <ErrorView message={message} onRetry={() => void query.refetch()} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <EmptyView
          title={t('profile.sharedLists.emptyTitle')}
          message={t('profile.sharedLists.emptyMessage')}
          centered
        />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.watchlistId}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <SharedWatchlistRow item={item} onChanged={invalidate} />
      )}
    />
  );
}

interface SharedWatchlistRowProps {
  item: WatchlistShareSummaryResponse;
  onChanged: () => void;
}

function SharedWatchlistRow({ item, onChanged }: SharedWatchlistRowProps) {
  const { t } = useTranslation();
  const { disable, rotate } = useWatchlistShareMutations(item.watchlistId);
  const isBusy = disable.isPending || rotate.isPending;

  const shareCurrentLink = useCallback(async () => {
    const stored = await getStoredWatchlistShareUrl(item.watchlistId);
    if (stored) {
      const message = buildWatchlistShareMessage(stored, t);
      await Share.share({ message, title: t('common.watchlist') });
      return;
    }

    try {
      const rotated = await rotate.mutateAsync();
      const message = buildWatchlistShareMessage(rotated.shareUrl, t);
      await Share.share({ message, title: t('common.watchlist') });
      onChanged();
    } catch {
      // rotate errors surface via mutation state; keep row stable
    }
  }, [item.watchlistId, onChanged, rotate, t]);

  const handleNewLink = useCallback(() => {
    void (async () => {
      try {
        await rotate.mutateAsync();
        onChanged();
      } catch {
        // no-op
      }
    })();
  }, [onChanged, rotate]);

  const handleStopSharing = useCallback(() => {
    void (async () => {
      try {
        await disable.mutateAsync();
        onChanged();
      } catch {
        // no-op
      }
    })();
  }, [disable, onChanged]);

  return (
    <View style={styles.card}>
      <AppText variant="body" style={styles.cardTitle} numberOfLines={2}>
        {item.watchlistName}
      </AppText>
      <View style={styles.actions}>
        <AppButton
          title={t('watchlistShare.shareLink')}
          variant="secondary"
          disabled={isBusy}
          onPress={() => void shareCurrentLink()}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('watchlistShare.createNewLink')}
          disabled={isBusy}
          onPress={handleNewLink}
          style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}
        >
          <AppText variant="caption" style={styles.textActionLabel}>
            {t('watchlistShare.createNewLink')}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('watchlistShare.disableSharing')}
          disabled={isBusy}
          onPress={handleStopSharing}
          style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}
        >
          <AppText variant="caption" style={styles.stopLabel}>
            {t('watchlistShare.disableSharing')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: HORIZONTAL_INSET,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: HORIZONTAL_INSET,
  },
  empty: {
    paddingHorizontal: HORIZONTAL_INSET,
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontWeight: '600',
  },
  actions: {
    gap: spacing.xs,
  },
  textAction: {
    alignSelf: 'flex-start',
    minHeight: interaction.touchTarget,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  textActionLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stopLabel: {
    color: colors.error,
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
