import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { premiumSheet } from '@/theme/premium-sheet';
import { borderRadius, spacing } from '@/theme/spacing';

export interface CatalogChipOption<T extends string | number | null> {
  value: T;
  label: string;
}

interface CatalogChipRowProps<T extends string | number | null> {
  options: CatalogChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabelFor?: (label: string) => string;
  testID?: string;
}

export function CatalogChipRow<T extends string | number | null>({
  options,
  value,
  onChange,
  accessibilityLabelFor,
  testID,
}: CatalogChipRowProps<T>) {
  return (
    <View style={styles.row} testID={testID}>
      {options.map((option) => {
        const selected = option.value === value;
        const label = option.label;

        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={accessibilityLabelFor?.(label) ?? label}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              style={[styles.chipLabel, selected && styles.chipLabelSelected]}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    backgroundColor: premiumSheet.secondary,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: premiumSheet.goldBorder,
    backgroundColor: premiumSheet.elevated,
  },
  chipLabel: {
    color: premiumSheet.textPrimary,
  },
  chipLabelSelected: {
    color: premiumSheet.mutedGold,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
