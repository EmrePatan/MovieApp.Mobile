import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export interface CatalogSortOption<T extends string> {
  value: T;
  label: string;
}

interface CatalogSortSheetProps<T extends string> {
  visible: boolean;
  title: string;
  closeLabel: string;
  options: CatalogSortOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  testID?: string;
}

export function CatalogSortSheet<T extends string>({
  visible,
  title,
  closeLabel,
  options,
  value,
  onSelect,
  onClose,
  testID,
}: CatalogSortSheetProps<T>) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} accessibilityRole="button" accessibilityLabel={closeLabel}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <Pressable onPress={(event) => event.stopPropagation()} testID={testID}>
            <View style={styles.header}>
              <AppText variant="subtitle">{title}</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.options}>
              {options.map((option) => {
                const selected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={option.label}
                    onPress={() => {
                      onSelect(option.value);
                      onClose();
                    }}
                    style={({ pressed }) => [
                      styles.optionRow,
                      selected && styles.optionRowSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText
                      variant="body"
                      style={selected ? styles.optionLabelSelected : undefined}
                    >
                      {option.label}
                    </AppText>
                    {selected ? (
                      <Ionicons name="checkmark" size={20} color={colors.accent} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </SafeAreaView>
      </Pressable>
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
  options: {
    gap: spacing.xs,
  },
  optionRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  optionRowSelected: {
    backgroundColor: colors.accentTint12,
  },
  optionLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
