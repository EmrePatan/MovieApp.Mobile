import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { EmptyView } from '@/components/common/EmptyView';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailFramedIconControl } from '@/features/details/shared/components/DetailFramedIconControl';
import { MY_COMMENTS_HORIZONTAL_INSET } from '@/features/reviews/utils/my-comments-layout';
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
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
const DETAIL_ROW_ACTION_SIZE = 42;
const BAR_MIN_HEIGHT = 60;

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
      <View style={styles.emptyWrap}>
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
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <SharedWatchlistBar item={item} onChanged={invalidate} />}
    />
  );
}

interface SharedWatchlistBarProps {
  item: WatchlistShareSummaryResponse;
  onChanged: () => void;
}

type BarIconActionTone = 'primary' | 'default' | 'destructive';

interface BarIconActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  disabled?: boolean;
  tone?: BarIconActionTone;
  onPress: () => void;
}

function BarIconAction({
  icon,
  accessibilityLabel,
  disabled = false,
  tone = 'default',
  onPress,
}: BarIconActionProps) {
  const frameVariant = tone === 'primary' ? 'gold' : 'neutral';
  const surfaceColor =
    tone === 'primary'
      ? colors.accentTint12
      : tone === 'destructive'
        ? colors.errorTint15
        : colors.surfaceElevated;
  const iconColor =
    tone === 'primary' ? colors.accent : tone === 'destructive' ? colors.error : colors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        pressed && !disabled && styles.pressed,
        disabled && styles.actionDisabled,
      ]}
    >
      <DetailFramedIconControl
        size={DETAIL_ROW_ACTION_SIZE}
        borderRadius={DETAIL_ROW_ACTION_SIZE / 2}
        variant={frameVariant}
        glow={tone === 'primary'}
        surfaceColor={surfaceColor}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </DetailFramedIconControl>
    </Pressable>
  );
}

function SharedWatchlistBar({ item, onChanged }: SharedWatchlistBarProps) {
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
      Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
    }
  }, [item.watchlistId, onChanged, rotate, t]);

  const handleNewLink = useCallback(() => {
    Alert.alert(
      t('watchlistShare.createNewLink'),
      t('profile.sharedLists.newLinkConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('watchlistShare.createNewLink'),
          onPress: () => {
            void (async () => {
              try {
                await rotate.mutateAsync();
                onChanged();
              } catch {
                Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
              }
            })();
          },
        },
      ],
    );
  }, [onChanged, rotate, t]);

  const handleStopSharing = useCallback(() => {
    Alert.alert(
      t('watchlistShare.disableSharing'),
      t('profile.sharedLists.stopConfirm', { name: item.watchlistName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('watchlistShare.disableSharing'),
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await disable.mutateAsync();
                onChanged();
              } catch {
                Alert.alert(t('watchlistShare.errorTitle'), t('watchlistShare.errorMessage'));
              }
            })();
          },
        },
      ],
    );
  }, [disable, item.watchlistName, onChanged, t]);

  return (
    <View style={styles.bar}>
      <View style={styles.barMain}>
        <View style={styles.barIcon}>
          <Ionicons name="bookmark" size={18} color={colors.libraryWatchlist} />
        </View>
        <AppText variant="body" style={styles.barTitle} numberOfLines={2}>
          {item.watchlistName}
        </AppText>
      </View>
      <View style={styles.actions}>
        <BarIconAction
          icon="share-outline"
          accessibilityLabel={t('watchlistShare.shareLink')}
          disabled={isBusy}
          tone="primary"
          onPress={() => void shareCurrentLink()}
        />
        <BarIconAction
          icon="refresh-outline"
          accessibilityLabel={t('watchlistShare.createNewLink')}
          disabled={isBusy}
          onPress={handleNewLink}
        />
        <BarIconAction
          icon="eye-off-outline"
          accessibilityLabel={t('watchlistShare.disableSharing')}
          disabled={isBusy}
          tone="destructive"
          onPress={handleStopSharing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: MY_COMMENTS_HORIZONTAL_INSET,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: MY_COMMENTS_HORIZONTAL_INSET,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: MY_COMMENTS_HORIZONTAL_INSET,
    paddingTop: spacing.xs,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: BAR_MIN_HEIGHT,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  barMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  barIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.libraryWatchlistTint12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: {
    flex: 1,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionDisabled: {
    opacity: interaction.busyOpacity,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
    transform: [{ scale: 0.96 }],
  },
});
