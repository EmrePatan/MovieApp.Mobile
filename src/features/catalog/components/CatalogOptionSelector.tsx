import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export interface CatalogOptionItem<T extends string> {
  value: T;
  label: string;
}

interface CatalogOptionSelectorProps<T extends string> {
  visible: boolean;
  title: string;
  closeLabel: string;
  options: CatalogOptionItem<T>[];
  values: T[];
  multi?: boolean;
  onChange: (values: T[]) => void;
  onClose: () => void;
  testID?: string;
}

export function CatalogOptionSelector<T extends string>({
  visible,
  title,
  closeLabel,
  options,
  values,
  multi = false,
  onChange,
  onClose,
  testID,
}: CatalogOptionSelectorProps<T>) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet} edges={['bottom']} testID={testID}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
              style={styles.backButton}
              testID={testID ? `${testID}-back` : undefined}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <AppText variant="subtitle" style={styles.title}>
              {title}
            </AppText>
            <View style={styles.backButton} />
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {options.map((option) => {
              const selected = values.includes(option.value);

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  onPress={() => {
                    if (multi) {
                      onChange(
                        selected
                          ? values.filter((value) => value !== option.value)
                          : [...values, option.value],
                      );
                      return;
                    }

                    onChange(selected ? [] : [option.value]);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText variant="body" style={selected ? styles.optionLabelSelected : undefined}>
                    {option.label}
                  </AppText>
                  {selected ? <Ionicons name="checkmark" size={20} color={colors.accent} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
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
    maxHeight: '88%',
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
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
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
