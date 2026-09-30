import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export interface CatalogOptionItem<T extends string> {
  value: T;
  label: string;
}

interface CatalogOptionListProps<T extends string> {
  options: CatalogOptionItem<T>[];
  values: T[];
  multi?: boolean;
  onChange: (values: T[]) => void;
  onSingleSelectComplete?: () => void;
  testID?: string;
}

/** Presentational option list for in-sheet drill-down (no Modal). */
export function CatalogOptionList<T extends string>({
  options,
  values,
  multi = false,
  onChange,
  onSingleSelectComplete,
  testID,
}: CatalogOptionListProps<T>) {
  return (
    <View style={styles.content} testID={testID}>
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
              onSingleSelectComplete?.();
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
    </View>
  );
}

/** @deprecated Use CatalogOptionList inside CatalogFilterSheetShell drill-down. */
export function CatalogOptionSelector<T extends string>(props: CatalogOptionListProps<T> & {
  visible: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const { visible, onClose, closeLabel, ...listProps } = props;
  if (!visible) {
    return null;
  }

  return (
    <View accessibilityLabel={closeLabel}>
      <CatalogOptionList {...listProps} onSingleSelectComplete={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  optionRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
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
