import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { AppInput } from '@/components/inputs/AppInput';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useCreateWatchlist, useWatchlistItemMutation } from '../hooks/useWatchlistMutations';
import { useWatchlistMembership, useWatchlists } from '../hooks/useWatchlists';
import type { WatchlistContentType } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface WatchlistPickerModalProps {
  visible: boolean;
  contentType: WatchlistContentType;
  contentId: string;
  onClose: () => void;
}

export function WatchlistPickerModal({
  visible,
  contentType,
  contentId,
  onClose,
}: WatchlistPickerModalProps) {
  const { data: watchlists = [], isLoading, isError, refetch } = useWatchlists(visible);
  const {
    data: membership = {},
    isLoading: isMembershipLoading,
    refetch: refetchMembership,
  } = useWatchlistMembership(contentType, contentId, visible);
  const watchlistItemMutation = useWatchlistItemMutation(contentType, contentId);
  const createWatchlistMutation = useCreateWatchlist(contentType, contentId);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );
  const [pendingWatchlistId, setPendingWatchlistId] = useState<string | null>(null);

  const isBusy =
    watchlistItemMutation.isPending || createWatchlistMutation.isPending || isMembershipLoading;

  const sortedWatchlists = useMemo(
    () => [...watchlists].sort((a, b) => a.name.localeCompare(b.name)),
    [watchlists],
  );

  const handleToggleItem = (watchlistId: string, isInWatchlist: boolean) => {
    setPendingWatchlistId(watchlistId);
    watchlistItemMutation.mutate(
      { watchlistId, isInWatchlist },
      {
        onSuccess: (added) => {
          setFeedback({
            message: added
              ? 'Added to watchlist.'
              : 'Removed from watchlist.',
            tone: 'success',
          });
          void refetchMembership();
        },
        onError: () => {
          setFeedback({
            message: 'Could not add this item to the watchlist.',
            tone: 'error',
          });
        },
        onSettled: () => {
          setPendingWatchlistId(null);
        },
      },
    );
  };

  const handleCreateWatchlist = () => {
    const trimmed = newWatchlistName.trim();
    if (trimmed.length === 0) {
      setFeedback({ message: 'Enter a watchlist name.', tone: 'error' });
      return;
    }

    createWatchlistMutation.mutate(trimmed, {
      onSuccess: (created) => {
        setNewWatchlistName('');
        setFeedback({ message: 'Watchlist created.', tone: 'success' });
        watchlistItemMutation.mutate(
          { watchlistId: created.id, isInWatchlist: false },
          {
            onSuccess: () => {
              setFeedback({ message: 'Added to watchlist.', tone: 'success' });
              void refetch();
              void refetchMembership();
            },
            onError: () => {
              setFeedback({
                message: 'Could not add this item to the watchlist.',
                tone: 'error',
              });
            },
          },
        );
      },
      onError: (error) => {
        setFeedback({
          message: isApiError(error) && error.kind === 'conflict'
            ? 'A watchlist with this name already exists.'
            : 'Could not create watchlist. Please try again.',
          tone: 'error',
        });
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.header}>
            <AppText variant="subtitle">Add to Watchlist</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          <FeedbackMessage
            message={feedback?.message ?? null}
            tone={feedback?.tone ?? 'info'}
            onDismiss={() => setFeedback(null)}
          />

          <View style={styles.createSection}>
            <AppInput
              label="New watchlist"
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              placeholder="Watchlist name"
              maxLength={100}
            />
            <AppButton
              title="Create and Add"
              variant="secondary"
              loading={createWatchlistMutation.isPending}
              disabled={isBusy}
              onPress={handleCreateWatchlist}
            />
          </View>

          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : isError ? (
            <View style={styles.centered}>
              <AppText variant="bodySmall" muted center>
                Could not load watchlists.
              </AppText>
              <AppButton title="Retry" variant="ghost" onPress={() => void refetch()} />
            </View>
          ) : sortedWatchlists.length === 0 ? (
            <View style={styles.centered}>
              <AppText variant="bodySmall" muted center>
                You do not have any watchlists yet.
              </AppText>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {sortedWatchlists.map((watchlist) => {
                const isInWatchlist = membership[watchlist.id] ?? false;
                const rowBusy = pendingWatchlistId === watchlist.id && watchlistItemMutation.isPending;

                return (
                  <Pressable
                    key={watchlist.id}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isInWatchlist
                        ? `Remove from ${watchlist.name}`
                        : `Add to ${watchlist.name}`
                    }
                    disabled={isBusy}
                    onPress={() => handleToggleItem(watchlist.id, isInWatchlist)}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && !isBusy && styles.pressed,
                      isInWatchlist && styles.rowActive,
                    ]}
                  >
                    <View style={styles.rowMeta}>
                      <AppText variant="body">{watchlist.name}</AppText>
                      <AppText variant="caption" muted>
                        {watchlist.itemCount} items
                      </AppText>
                    </View>
                    {rowBusy ? (
                      <ActivityIndicator color={colors.accent} size="small" />
                    ) : (
                      <Ionicons
                        name={isInWatchlist ? 'checkmark-circle' : 'add-circle-outline'}
                        size={22}
                        color={isInWatchlist ? colors.success : colors.textSecondary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createSection: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  rowActive: {
    borderColor: colors.success,
  },
  rowMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
});
