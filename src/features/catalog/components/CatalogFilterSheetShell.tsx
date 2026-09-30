import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
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
  /** Lifts sheet content above the software keyboard (e.g. keyword search drill-down). */
  keyboardAvoiding?: boolean;
  /** Use flex layout instead of outer ScrollView (pair with keyboardAvoiding). */
  flexContent?: boolean;
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
  keyboardAvoiding = false,
  flexContent = false,
  testID,
}: CatalogFilterSheetShellProps) {
  const headerIcon = headerAction === 'back' ? 'chevron-back' : 'close';

  const sheet = (
    <SafeAreaView
      style={[styles.sheet, keyboardAvoiding && styles.sheetKeyboard]}
      edges={['bottom']}
      testID={testID}
    >
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

      {flexContent ? (
        <View style={styles.flexBody}>{children}</View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}

      {showFooterActions && resetLabel && applyLabel && onReset && onApply ? (
        <View style={styles.actions}>
          <AppButton title={resetLabel} variant="secondary" onPress={onReset} />
          <AppButton title={applyLabel} onPress={onApply} />
        </View>
      ) : null}
    </SafeAreaView>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onHeaderAction}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onHeaderAction}
          accessibilityRole="button"
          accessibilityLabel={headerActionLabel}
        />
        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            {sheet}
          </KeyboardAvoidingView>
        ) : (
          sheet
        )}
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
  keyboardAvoid: {
    width: '100%',
    maxHeight: '85%',
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
  sheetKeyboard: {
    flex: 1,
    maxHeight: '85%',
  },
  flexBody: {
    flex: 1,
    minHeight: 0,
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
