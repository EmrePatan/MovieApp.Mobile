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
import { interaction } from '@/theme/interaction';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { typography } from '@/theme/typography';
import {
  getVisibleWatchlists,
  shouldCollapseWatchlistPicker,
} from '../utils/watchlist-picker-collapse';

const sheet = premiumSheet;

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

  const dismissCreateKeyboard = useCallback(() => {
    createInputRef.current?.blur();
    Keyboard.dismiss();
  }, []);

  const handleClose = useCallback(() => {
    dismissCreateKeyboard();
    onClose();
  }, [dismissCreateKeyboard, onClose]);

  const handleToggleItem = (watchlistId: string, isInWatchlist: boolean) => {
    const isAdding = !isInWatchlist;
    setPendingWatchlistId(watchlistId);
    watchlistItemMutation.mutate(
      { watchlistId, isInWatchlist },
      {
        onSuccess: () => {
          setErrorMessage(null);
          void refetchMembership();
          if (isAdding) {
            handleClose();
          }
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
              handleClose();
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
      {watchlistsToRender.map((watchlist) => {
        const isInWatchlist = membership[watchlist.id] ?? false;
        const rowBusy = pendingWatchlistId === watchlist.id && watchlistItemMutation.isPending;

        return (
          <Pressable
            key={watchlist.id}
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
                color={isInWatchlist ? sheet.mutedGold : sheet.textSecondary}
              />
            </View>
            <View style={styles.rowMeta}>
              <AppText variant="bodySmall" style={styles.rowTitle} numberOfLines={1}>
                {watchlist.name}
              </AppText>
              <AppText variant="caption" style={styles.rowSubtitle} numberOfLines={1}>
                {t('watchlists.picker.itemCount', { count: watchlist.itemCount })}
              </AppText>
            </View>
            {rowBusy ? (
              <ActivityIndicator color={sheet.mutedGold} size="small" />
            ) : (
              <Ionicons
                name={isInWatchlist ? 'checkmark-circle' : 'add-circle-outline'}
                size={20}
                color={isInWatchlist ? sheet.mutedGold : sheet.textSecondary}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );

  const listContent = isLoading ? (
    <View style={styles.stateBlock}>
      <ActivityIndicator color={sheet.mutedGold} />
    </View>
  ) : isError ? (
    <View style={styles.stateBlock}>
      <AppText variant="caption" style={styles.stateMuted} center>
        {t('library.watchlistsOverview.loadError')}
      </AppText>
      <AppButton title={t('common.retry')} variant="ghost" onPress={() => void refetch()} />
    </View>
  ) : sortedWatchlists.length === 0 ? (
    <View style={styles.stateBlock} accessibilityRole="text">
      <View style={styles.emptyIcon}>
        <Ionicons name="albums-outline" size={22} color={sheet.textSecondary} />
      </View>
      <AppText variant="bodySmall" style={styles.emptyTitle}>
        {t('library.watchlistsOverview.emptyTitle')}
      </AppText>
      <AppText variant="caption" style={styles.stateMuted} center>
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoidRoot}
    >
      <View style={styles.overlay} testID="watchlist-picker-sheet">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          style={styles.backdrop}
          onPress={handleClose}
        />
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.handle} />

          <View style={styles.body}>
            <AppText variant="title" style={styles.sheetTitle}>
              {t('common.addToWatchlist')}
            </AppText>

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
                    color={sheet.textSecondary}
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
                <Ionicons name="add" size={16} color={sheet.mutedGold} />
                <TextInput
                  ref={createInputRef}
                  accessibilityLabel={t('common.newWatchlist')}
                  value={newWatchlistName}
                  onChangeText={setNewWatchlistName}
                  placeholder={t('watchlists.picker.listNamePlaceholder')}
                  placeholderTextColor={sheet.textSecondary}
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
                    <ActivityIndicator color={sheet.textPrimary} size="small" />
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
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: premiumSheetChrome.overlay,
  backdrop: premiumSheetChrome.backdrop,
  sheet: premiumSheetChrome.sheet,
  handle: premiumSheetChrome.handle,
  body: {
    paddingTop: 18,
    paddingBottom: 20,
    gap: 16,
  },
  sheetTitle: premiumSheetChrome.title,
  listsSection: {
    gap: 10,
  },
  expandedListScroll: {
    maxHeight: 220,
  },
  expandListsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 36,
    paddingVertical: 2,
  },
  expandListsLabel: {
    color: sheet.textSecondary,
    fontWeight: '500',
  },
  createFooter: {
    gap: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: sheet.border,
  },
  sectionLabel: {
    color: sheet.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  createComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: sheet.elevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: sheet.border,
    paddingLeft: 12,
    paddingRight: 6,
    minHeight: 48,
  },
  createComposerFocused: {
    borderColor: sheet.goldBorder,
  },
  createInput: {
    flex: 1,
    color: sheet.textPrimary,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 20,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  createAction: {
    minWidth: 56,
    minHeight: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: sheet.secondary,
  },
  createActionReady: {
    backgroundColor: 'rgba(210, 164, 81, 0.18)',
    borderWidth: 1,
    borderColor: sheet.goldBorder,
  },
  createActionLabel: {
    color: sheet.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  createActionLabelReady: {
    color: sheet.mutedGold,
  },
  listContainer: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#28262C',
    backgroundColor: sheet.secondary,
  },
  rowSelected: {
    borderColor: sheet.goldBorder,
    backgroundColor: sheet.elevated,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: sheet.iconSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconSelected: {
    backgroundColor: 'rgba(210, 164, 81, 0.12)',
  },
  rowMeta: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  rowTitle: {
    fontWeight: '600',
    color: sheet.textPrimary,
  },
  rowSubtitle: {
    color: sheet.textSecondary,
  },
  stateBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 14,
    backgroundColor: sheet.secondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: sheet.border,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: sheet.iconSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: sheet.textPrimary,
    fontWeight: '600',
  },
  stateMuted: {
    color: sheet.textSecondary,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
