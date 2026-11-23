import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SheetHandle, SwipeSheet } from '@/components/layout/SwipeableSheet';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';
import { GlassSheetLayer } from '@/components/common/GlassSheetLayer';

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
      <Pressable
        style={premiumSheetChrome.overlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
      >
        <SwipeSheet onClose={onClose} style={styles.sheet} bottomInset>
          <GlassSheetLayer />
          <Pressable onPress={(event) => event.stopPropagation()} testID={testID}>
            <SheetHandle />
            <View style={styles.header}>
              <AppText variant="subtitle" style={styles.title}>
                {title}
              </AppText>
              <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose}>
                <Ionicons name="close" size={22} color={premiumSheet.textPrimary} />
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
                      premiumSheetChrome.optionRow,
                      selected && premiumSheetChrome.optionRowSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText
                      variant="body"
                      style={selected ? premiumSheetChrome.optionLabelSelected : styles.optionLabel}
                    >
                      {option.label}
                    </AppText>
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color={premiumSheet.mutedGold} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </SwipeSheet>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...premiumSheetChrome.sheet,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: premiumSheet.textPrimary,
    fontWeight: '700',
  },
  options: {
    gap: 8,
  },
  optionLabel: {
    color: premiumSheet.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
