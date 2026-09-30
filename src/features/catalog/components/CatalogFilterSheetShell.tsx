import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export type CatalogFilterSheetHeaderAction = 'close' | 'back';

interface CatalogFilterSheetShellProps {
  visible: boolean;
  title: string;
  headerAction: CatalogFilterSheetHeaderAction;
  headerActionLabel: string;
  onHeaderAction: () => void;
  children: ReactNode;
  resetLabel?: string;
  applyLabel?: string;
  onReset?: () => void;
  onApply?: () => void;
  showFooterActions?: boolean;
  testID?: string;
}

export function CatalogFilterSheetShell({
  visible,
  title,
  headerAction,
  headerActionLabel,
  onHeaderAction,
  children,
  resetLabel,
  applyLabel,
  onReset,
  onApply,
  showFooterActions = true,
  testID,
}: CatalogFilterSheetShellProps) {
  const headerIcon = headerAction === 'back' ? 'chevron-back' : 'close';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onHeaderAction}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onHeaderAction}
          accessibilityRole="button"
          accessibilityLabel={headerActionLabel}
        />
        <SafeAreaView style={styles.sheet} edges={['bottom']} testID={testID}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={headerActionLabel}
              onPress={onHeaderAction}
              hitSlop={8}
              style={styles.headerIconButton}
              testID={testID ? `${testID}-header-action` : undefined}
            >
              <Ionicons name={headerIcon} size={24} color={colors.textPrimary} />
            </Pressable>
            <AppText variant="subtitle" style={styles.headerTitle} numberOfLines={1}>
              {title}
            </AppText>
            <View style={styles.headerIconButton} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {showFooterActions && resetLabel && applyLabel && onReset && onApply ? (
            <View style={styles.actions}>
              <AppButton title={resetLabel} variant="secondary" onPress={onReset} />
              <AppButton title={applyLabel} onPress={onApply} />
            </View>
          ) : null}
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
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
