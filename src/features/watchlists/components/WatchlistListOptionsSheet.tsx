import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SheetHandle, SwipeSheet } from '@/components/layout/SwipeableSheet';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { GlassSheetLayer } from '@/components/common/GlassSheetLayer';

type SheetView = 'options' | 'confirmDelete';

interface WatchlistListOptionsSheetProps {
  visible: boolean;
  listName: string;
  deleteLoading?: boolean;
  onClose: () => void;
  onRename: () => void;
  onShare?: () => void;
  onConfirmDelete: () => void;
}

interface OptionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  destructive?: boolean;
  onPress: () => void;
  testID?: string;
}

function OptionRow({ icon, label, destructive = false, onPress, testID }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.optionRow, pressed && styles.optionRowPressed]}
    >
      <View style={[styles.optionIconWrap, destructive && styles.optionIconWrapDestructive]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.error : premiumSheet.mutedGold}
        />
      </View>
      <AppText
        variant="body"
        style={[styles.optionLabel, destructive && styles.optionLabelDestructive]}
      >
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={18} color={premiumSheet.textSecondary} />
    </Pressable>
  );
}

interface WatchlistListOptionsSheetContentProps {
  listName: string;
  deleteLoading: boolean;
  onClose: () => void;
  onRename: () => void;
  onShare?: () => void;
  onConfirmDelete: () => void;
}

function WatchlistListOptionsSheetContent({
  listName,
  deleteLoading,
  onClose,
  onRename,
  onShare,
  onConfirmDelete,
}: WatchlistListOptionsSheetContentProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<SheetView>('options');

  const handleRename = () => {
    onClose();
    onRename();
  };

  const handleShare = () => {
    onShare?.();
  };

  const handleDeletePress = () => {
    setView('confirmDelete');
  };

  const handleBackToOptions = () => {
    setView('options');
  };

  const isConfirmView = view === 'confirmDelete';

  return (
    <View style={premiumSheetChrome.overlay} testID="watchlist-list-options-sheet">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.closeListOptions')}
        style={premiumSheetChrome.backdrop}
        onPress={onClose}
      />
      <SwipeSheet onClose={onClose} style={styles.sheet} bottomInset>
        <GlassSheetLayer />
        <SheetHandle />

        {isConfirmView ? (
          <View style={styles.confirmContent}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="trash-outline" size={28} color={colors.error} />
            </View>
            <AppText variant="subtitle" style={[styles.confirmTitle, styles.sheetTitle]}>
              {t('watchlists.optionsSheet.confirmTitle')}
            </AppText>
            <AppText variant="bodySmall" muted style={styles.confirmMessage}>
              {t('watchlists.optionsSheet.confirmMessage', { name: listName })}
            </AppText>

            <View style={styles.confirmActions}>
              <AppButton
                title={t('common.deleteList')}
                variant="destructive"
                loading={deleteLoading}
                disabled={deleteLoading}
                onPress={onConfirmDelete}
                testID="watchlist-delete-confirm-button"
              />
              <AppButton
                title={t('common.cancel')}
                variant="ghost"
                disabled={deleteLoading}
                onPress={handleBackToOptions}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <AppText variant="subtitle" style={styles.sheetTitle}>{t('watchlists.optionsSheet.listOptions')}</AppText>
                <AppText variant="bodySmall" muted numberOfLines={1}>
                  {listName}
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                onPress={onClose}
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={24} color={premiumSheet.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.optionsGroup}>
              {onShare ? (
                <>
                  <OptionRow
                    icon="share-outline"
                    label={t('watchlists.optionsSheet.shareList')}
                    onPress={handleShare}
                    testID="watchlist-share-option"
                  />
                  <View style={styles.optionDivider} />
                </>
              ) : null}
              <OptionRow
                icon="pencil-outline"
                label={t('watchlists.optionsSheet.renameList')}
                onPress={handleRename}
                testID="watchlist-rename-option"
              />
              <View style={styles.optionDivider} />
              <OptionRow
                icon="trash-outline"
                label={t('watchlists.optionsSheet.deleteList')}
                destructive
                onPress={handleDeletePress}
                testID="watchlist-delete-option"
              />
            </View>
          </>
        )}
      </SwipeSheet>
    </View>
  );
}

export function WatchlistListOptionsSheet({
  visible,
  listName,
  deleteLoading = false,
  onClose,
  onRename,
  onShare,
  onConfirmDelete,
}: WatchlistListOptionsSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <WatchlistListOptionsSheetContent
          listName={listName}
          deleteLoading={deleteLoading}
          onClose={onClose}
          onRename={onRename}
          onShare={onShare}
          onConfirmDelete={onConfirmDelete}
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...premiumSheetChrome.sheet,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  sheetTitle: {
    color: premiumSheet.textPrimary,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  closeButton: {
    minWidth: interaction.touchTarget,
    minHeight: interaction.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsGroup: {
    backgroundColor: premiumSheet.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: interaction.touchTarget,
  },
  optionRowPressed: {
    opacity: interaction.pressedOpacity,
    backgroundColor: 'rgba(210, 164, 81, 0.12)',
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(210, 164, 81, 0.12)',
  },
  optionIconWrapDestructive: {
    backgroundColor: colors.errorTint15,
  },
  optionLabel: {
    flex: 1,
  },
  optionLabelDestructive: {
    color: colors.error,
  },
  optionDivider: {
    height: 1,
    backgroundColor: premiumSheet.border,
    marginHorizontal: spacing.md,
  },
  confirmContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  confirmIconWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorTint15,
  },
  confirmTitle: {
    textAlign: 'center',
  },
  confirmMessage: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  confirmActions: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
