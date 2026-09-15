import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { DISCOVERY_BROWSE_MODES, type DiscoveryBrowseMode } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface DiscoveryModeControlProps {
  value: DiscoveryBrowseMode;
  onChange: (value: DiscoveryBrowseMode) => void;
}

export function DiscoveryModeControl({ value, onChange }: DiscoveryModeControlProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      accessibilityRole="tablist"
    >
      {DISCOVERY_BROWSE_MODES.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              style={[styles.label, selected && styles.labelSelected]}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
