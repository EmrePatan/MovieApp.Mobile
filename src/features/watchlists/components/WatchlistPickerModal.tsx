import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useCreateWatchlist, useWatchlistItemMutation } from '../hooks/useWatchlistMutations';
import { useWatchlistMembership, useWatchlists } from '../hooks/useWatchlists';
import type { WatchlistContentType } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { typography } from '@/theme/typography';
import {
  getVisibleWatchlists,
  shouldCollapseWatchlistPicker,
} from '../utils/watchlist-picker-collapse';

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
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {visible ? (
        <WatchlistPickerBody
          key={`${contentType}-${contentId}`}
          contentType={contentType}
          contentId={contentId}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function WatchlistPickerBody({
  contentType,
  contentId,
  onClose,
}: Omit<WatchlistPickerModalProps, 'visible'>) {
  const { t } = useTranslation();
  const { data: watchlists = [], isLoading, isError, refetch } = useWatchlists(true);
  const {
    data: membership = {},
    isLoading: isMembershipLoading,
    refetch: refetchMembership,
  } = useWatchlistMembership(contentType, contentId, true);
  const watchlistItemMutation = useWatchlistItemMutation(contentType, contentId);
  const createWatchlistMutation = useCreateWatchlist(contentType, contentId);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingWatchlistId, setPendingWatchlistId] = useState<string | null>(null);
  const [isCreateFocused, setIsCreateFocused] = useState(false);
  const [listsExpanded, setListsExpanded] = useState(false);
  const listScrollRef = useRef<ScrollView>(null);
  const createInputRef = useRef<TextInput>(null);

  const isBusy =
    watchlistItemMutation.isPending || createWatchlistMutation.isPending || isMembershipLoading;

  const trimmedWatchlistName = newWatchlistName.trim();
  const canCreateWatchlist =
    trimmedWatchlistName.length > 0 && !createWatchlistMutation.isPending;

  const sortedWatchlists = useMemo(
    () => [...watchlists].sort((a, b) => a.name.localeCompare(b.name)),
    [watchlists],
  );
  const canCollapseLists = shouldCollapseWatchlistPicker(sortedWatchlists.length);
  const visibleWatchlists = getVisibleWatchlists(sortedWatchlists, listsExpanded);
  const handleToggleItem = (watchlistId: string, isInWatchlist: boolean) => {
    setPendingWatchlistId(watchlistId);
    watchlistItemMutation.mutate(
      { watchlistId, isInWatchlist },
      {
        onSuccess: () => {
          setErrorMessage(null);
          void refetchMembership();
        },
        onError: () => {
          setErrorMessage(t('watchlists.picker.updateError'));
        },
        onSettled: () => {
          setPendingWatchlistId(null);
        },
      },
    );
  };

  const dismissCreateKeyboard = useCallback(() => {
    createInputRef.current?.blur();
    Keyboard.dismiss();
  }, []);

  const handleClose = useCallback(() => {
    dismissCreateKeyboard();
    onClose();
  }, [dismissCreateKeyboard, onClose]);

  const handleCreateFocus = useCallback(() => {
    setIsCreateFocused(true);
  }, []);

  const handleCreateWatchlist = () => {
    if (trimmedWatchlistName.length === 0) {
      setErrorMessage(t('watchlists.picker.enterName'));
      return;
    }

    dismissCreateKeyboard();

    createWatchlistMutation.mutate(trimmedWatchlistName, {
      onSuccess: (created) => {
        setNewWatchlistName('');
        setErrorMessage(null);
        watchlistItemMutation.mutate(
          { watchlistId: created.id, isInWatchlist: false },
          {
            onSuccess: () => {
              setErrorMessage(null);
              void refetch();
              void refetchMembership();
            },
            onError: () => {
              setErrorMessage(t('watchlists.picker.updateError'));
            },
          },
        );
      },
      onError: (error) => {
        setErrorMessage(
          isApiError(error) && error.kind === 'conflict'
            ? t('watchlists.picker.createConflict')
            : t('watchlists.picker.createError'),
        );
      },
    });
  };

  const renderWatchlistRows = (
    watchlistsToRender: typeof sortedWatchlists,
  ) => (
    <View style={styles.listContainer}>
      {watchlistsToRender.map((watchlist, index) => {
        const isInWatchlist = membership[watchlist.id] ?? false;
        const rowBusy = pendingWatchlistId === watchlist.id && watchlistItemMutation.isPending;

        return (
          <View key={watchlist.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isInWatchlist
                  ? t('common.removeFromNamedWatchlist', { name: watchlist.name })
                  : t('common.addToNamedWatchlist', { name: watchlist.name })
              }
              accessibilityState={{ selected: isInWatchlist, disabled: isBusy }}
              disabled={isBusy}
              onPress={() => handleToggleItem(watchlist.id, isInWatchlist)}
              style={({ pressed }) => [
                styles.row,
                isInWatchlist && styles.rowSelected,
                pressed && !isBusy && styles.pressed,
              ]}
            >
              <View style={[styles.rowIcon, isInWatchlist && styles.rowIconSelected]}>
                <Ionicons
                  name={isInWatchlist ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={isInWatchlist ? colors.accent : colors.textMuted}
                />
              </View>
              <View style={styles.rowMeta}>
                <AppText variant="bodySmall" style={styles.rowTitle} numberOfLines={1}>
                  {watchlist.name}
                </AppText>
                <AppText variant="caption" muted>
                  {t('watchlists.picker.itemCount', { count: watchlist.itemCount })}
                </AppText>
              </View>
              {rowBusy ? (
                <ActivityIndicator color={colors.accent} size="small" />
              ) : (
                <Ionicons
                  name={isInWatchlist ? 'checkmark-circle' : 'add-circle-outline'}
                  size={22}
                  color={isInWatchlist ? colors.accent : colors.textMuted}
                />
              )}
            </Pressable>
            {index < watchlistsToRender.length - 1 ? <View style={styles.rowDivider} /> : null}
          </View>
        );
      })}
    </View>
  );

  const listContent = isLoading ? (
    <View style={styles.stateBlock}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : isError ? (
    <View style={styles.stateBlock}>
      <AppText variant="caption" muted center>
        {t('library.watchlistsOverview.loadError')}
      </AppText>
      <AppButton title={t('common.retry')} variant="ghost" onPress={() => void refetch()} />
    </View>
  ) : sortedWatchlists.length === 0 ? (
    <View style={styles.stateBlock} accessibilityRole="text">
      <View style={styles.emptyIcon}>
        <Ionicons name="albums-outline" size={22} color={colors.textMuted} />
      </View>
      <AppText variant="bodySmall" style={styles.emptyTitle}>
        {t('library.watchlistsOverview.emptyTitle')}
      </AppText>
      <AppText variant="caption" muted center>
        {t('library.watchlistsOverview.emptyMessage')}
      </AppText>
    </View>
  ) : listsExpanded ? (
    <ScrollView
      ref={listScrollRef}
      style={styles.expandedListScroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {renderWatchlistRows(visibleWatchlists)}
    </ScrollView>
  ) : (
    renderWatchlistRows(visibleWatchlists)
  );

  return (
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.closeWatchlistPicker')}
          onPress={handleClose}
          style={styles.dismissArea}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="bookmark-outline" size={16} color={colors.accent} />
              </View>
              <View style={styles.headerCopy}>
                <AppText variant="bodySmall" style={styles.headerTitle}>
                  {t('common.addToWatchlist')}
                </AppText>
                <AppText variant="caption" muted>
                  {t('watchlists.picker.subtitle')}
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                onPress={handleClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {errorMessage ? (
              <FeedbackMessage
                message={errorMessage}
                tone="error"
                onDismiss={() => setErrorMessage(null)}
              />
            ) : null}

            <View style={styles.listsSection}>
              <AppText variant="caption" style={styles.sectionLabel}>
                {t('watchlists.selector.yourWatchlists')}
              </AppText>
              {listContent}
              {canCollapseLists ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    listsExpanded
                      ? t('common.showFewerLists')
                      : t('common.showAllLists', { count: sortedWatchlists.length })
                  }
                  onPress={() => setListsExpanded((expanded) => !expanded)}
                  style={({ pressed }) => [styles.expandListsButton, pressed && styles.pressed]}
                >
                  <AppText variant="caption" style={styles.expandListsLabel}>
                    {listsExpanded
                      ? t('common.showFewerLists')
                      : t('common.showAllLists', { count: sortedWatchlists.length })}
                  </AppText>
                  <Ionicons
                    name={listsExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.textSecondary}
                  />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.createFooter}>
              <AppText variant="caption" style={styles.sectionLabel}>
                {t('common.newList')}
              </AppText>
              <View
                style={[
                  styles.createComposer,
                  isCreateFocused && styles.createComposerFocused,
                ]}
              >
                <Ionicons name="add" size={16} color={colors.accent} />
                <TextInput
                  ref={createInputRef}
                  accessibilityLabel={t('common.newWatchlist')}
                  value={newWatchlistName}
                  onChangeText={setNewWatchlistName}
                  placeholder={t('watchlists.picker.listNamePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  style={styles.createInput}
                  maxLength={100}
                  autoCorrect={false}
                  returnKeyType="done"
                  onFocus={handleCreateFocus}
                  onBlur={() => setIsCreateFocused(false)}
                  onSubmitEditing={() => {
                    if (canCreateWatchlist) {
                      handleCreateWatchlist();
                    }
                  }}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.createAndAdd')}
                  accessibilityState={{
                    disabled: !canCreateWatchlist,
                    busy: createWatchlistMutation.isPending,
                  }}
                  disabled={!canCreateWatchlist}
                  onPress={handleCreateWatchlist}
                  style={({ pressed }) => [
                    styles.createAction,
                    canCreateWatchlist && styles.createActionReady,
                    pressed && canCreateWatchlist && styles.pressed,
                  ]}
                >
                  {createWatchlistMutation.isPending ? (
                    <ActivityIndicator color={colors.textPrimary} size="small" />
                  ) : (
                    <AppText
                      variant="caption"
                      style={[
                        styles.createActionLabel,
                        canCreateWatchlist && styles.createActionLabelReady,
                      ]}
                    >
                      {t('common.create')}
                    </AppText>
                  )}
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  dismissArea: {
    flex: 1,
  },
  keyboardAvoid: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listsSection: {
    gap: spacing.xs,
  },
  expandedListScroll: {
    maxHeight: 220,
  },
  expandListsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 36,
    paddingVertical: 2,
  },
  expandListsLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  createFooter: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  createComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    minHeight: 40,
  },
  createComposerFocused: {
    borderColor: colors.accentTint18,
    backgroundColor: colors.inputBackground,
  },
  createInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 20,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  createAction: {
    minWidth: 48,
    minHeight: 30,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  createActionReady: {
    backgroundColor: colors.accent,
  },
  createActionLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  createActionLabelReady: {
    color: colors.textPrimary,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: interaction.touchTarget,
  },
  rowSelected: {
    backgroundColor: colors.accentTint12,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconSelected: {
    backgroundColor: colors.accentTint18,
  },
  rowMeta: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.sm + 28 + spacing.xs,
  },
  stateBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
