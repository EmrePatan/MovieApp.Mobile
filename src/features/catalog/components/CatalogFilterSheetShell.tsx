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
import { SheetHandle, SwipeSheet } from '@/components/layout/SwipeableSheet';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';
import { GlassSheetLayer } from '@/components/common/GlassSheetLayer';

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
  /** Keyword drill-down manages its own scroll + keyboard; avoids nested scroll with iOS insets. */
  keywordDrillDown?: boolean;
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
  keywordDrillDown = false,
  testID,
}: CatalogFilterSheetShellProps) {
  const headerIcon = headerAction === 'back' ? 'chevron-back' : 'close';
  // The sheet is bottom-anchored inside a Modal, so the overlay itself has to make room for the
  // keyboard (custom year range inputs sit low in the list). The keyword drill-down handles its
  // own keyboard, so it is left alone to avoid padding twice.
  const Overlay = keywordDrillDown ? View : KeyboardAvoidingView;
  const overlayProps = keywordDrillDown
    ? {}
    : { behavior: Platform.OS === 'ios' ? ('padding' as const) : undefined };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onHeaderAction}>
      <Overlay style={premiumSheetChrome.overlay} {...overlayProps}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onHeaderAction}
          accessibilityRole="button"
          accessibilityLabel={headerActionLabel}
        />
        <SwipeSheet
          onClose={onHeaderAction}
          style={[styles.sheet, keywordDrillDown && styles.sheetKeywordDrillDown]}
          bottomInset
          testID={testID}
        >
          <GlassSheetLayer />
          <SheetHandle />
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={headerActionLabel}
              onPress={onHeaderAction}
              hitSlop={8}
              style={styles.headerIconButton}
              testID={testID ? `${testID}-header-action` : undefined}
            >
              <Ionicons name={headerIcon} size={24} color={premiumSheet.textPrimary} />
            </Pressable>
            <AppText variant="subtitle" style={styles.headerTitle} numberOfLines={1}>
              {title}
            </AppText>
            <View style={styles.headerIconButton} />
          </View>

          {keywordDrillDown ? (
            <View style={styles.keywordBody}>{children}</View>
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
        </SwipeSheet>
      </Overlay>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...premiumSheetChrome.sheet,
    maxHeight: '85%',
    paddingBottom: spacing.md,
  },
  sheetKeywordDrillDown: {
    height: '85%',
    maxHeight: '85%',
  },
  keywordBody: {
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
    color: premiumSheet.textPrimary,
    fontWeight: '700',
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
    borderTopWidth: 1,
    borderTopColor: premiumSheet.border,
  },
});
