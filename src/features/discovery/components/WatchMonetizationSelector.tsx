import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { WATCH_MONETIZATION_OPTIONS, type WatchMonetizationType } from '../watch-provider-types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface WatchMonetizationSelectorProps {
  selectedTypes: WatchMonetizationType[];
  onToggle: (type: WatchMonetizationType) => void;
}

export function WatchMonetizationSelector({
  selectedTypes,
  onToggle,
}: WatchMonetizationSelectorProps) {
  return (
    <View style={styles.chipGrid}>
      {WATCH_MONETIZATION_OPTIONS.map((option) => {
        const selected = selectedTypes.includes(option.value);

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onToggle(option.value)}
            style={[styles.chip, selected && styles.chipSelected]}
            testID={`watch-monetization-${option.value}`}
          >
            <AppText
              variant="caption"
              style={[styles.chipLabel, selected && styles.chipLabelSelected]}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
  chipLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.accent,
  },
});
