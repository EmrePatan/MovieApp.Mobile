import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

type SheetView = 'options' | 'confirmDelete';

interface WatchlistListOptionsSheetProps {
  visible: boolean;
  listName: string;
  deleteLoading?: boolean;
  onClose: () => void;
  onRename: () => void;
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
          color={destructive ? colors.error : colors.accent}
        />
      </View>
      <AppText
        variant="body"
        style={[styles.optionLabel, destructive && styles.optionLabelDestructive]}
      >
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

interface WatchlistListOptionsSheetContentProps {
  listName: string;
  deleteLoading: boolean;
  onClose: () => void;
  onRename: () => void;
  onConfirmDelete: () => void;
}

function WatchlistListOptionsSheetContent({
  listName,
  deleteLoading,
  onClose,
  onRename,
  onConfirmDelete,
}: WatchlistListOptionsSheetContentProps) {
  const [view, setView] = useState<SheetView>('options');

  const handleRename = () => {
    onClose();
    onRename();
  };

  const handleDeletePress = () => {
    setView('confirmDelete');
  };

  const handleBackToOptions = () => {
    setView('options');
  };

  const isConfirmView = view === 'confirmDelete';

  return (
    <View style={styles.overlay} testID="watchlist-list-options-sheet">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close list options"
        style={styles.backdrop}
        onPress={onClose}
      />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />

        {isConfirmView ? (
          <View style={styles.confirmContent}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="trash-outline" size={28} color={colors.error} />
            </View>
            <AppText variant="subtitle" style={styles.confirmTitle}>
              Delete list
            </AppText>
            <AppText variant="bodySmall" muted style={styles.confirmMessage}>
              Delete "{listName}"? This cannot be undone.
            </AppText>

            <View style={styles.confirmActions}>
              <AppButton
                title="Delete List"
                variant="destructive"
                loading={deleteLoading}
                disabled={deleteLoading}
                onPress={onConfirmDelete}
                testID="watchlist-delete-confirm-button"
              />
              <AppButton
                title="Cancel"
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
                <AppText variant="subtitle">List options</AppText>
                <AppText variant="bodySmall" muted numberOfLines={1}>
                  {listName}
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.optionsGroup}>
              <OptionRow
                icon="pencil-outline"
                label="Rename List"
                onPress={handleRename}
                testID="watchlist-rename-option"
              />
              <View style={styles.optionDivider} />
              <OptionRow
                icon="trash-outline"
                label="Delete List"
                destructive
                onPress={handleDeletePress}
                testID="watchlist-delete-option"
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

export function WatchlistListOptionsSheet({
  visible,
  listName,
  deleteLoading = false,
  onClose,
  onRename,
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
          onConfirmDelete={onConfirmDelete}
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
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
    backgroundColor: colors.accentTint12,
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
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
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
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
