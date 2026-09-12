import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { DiscoveryKind } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface DiscoveryKindControlProps {
  value: DiscoveryKind;
  onChange: (value: DiscoveryKind) => void;
}

const OPTIONS: { value: DiscoveryKind; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Popular' },
];

export function DiscoveryKindControl({ value, onChange }: DiscoveryKindControlProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.pressed,
            ]}
          >
            <AppText variant="bodySmall" style={selected ? styles.selectedText : undefined}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },
  pressed: {
    opacity: 0.85,
  },
  selectedText: {
    color: colors.accent,
    fontWeight: '600',
  },
});
