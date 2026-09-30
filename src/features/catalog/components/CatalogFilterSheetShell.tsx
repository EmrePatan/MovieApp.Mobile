import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface CatalogFilterSheetShellProps {
  visible: boolean;
  title: string;
  closeLabel: string;
  resetLabel: string;
  applyLabel: string;
  children: ReactNode;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  testID?: string;
}

export function CatalogFilterSheetShell({
  visible,
  title,
  closeLabel,
  resetLabel,
  applyLabel,
  children,
  onClose,
  onReset,
  onApply,
  testID,
}: CatalogFilterSheetShellProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel={closeLabel} />
        <SafeAreaView style={styles.sheet} edges={['bottom']} testID={testID}>
          <View style={styles.header}>
            <AppText variant="subtitle">{title}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          <View style={styles.actions}>
            <AppButton title={resetLabel} variant="secondary" onPress={onReset} />
            <AppButton title={applyLabel} onPress={onApply} />
          </View>
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
    maxHeight: '90%',
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
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
