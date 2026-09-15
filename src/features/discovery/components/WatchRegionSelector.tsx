import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { getWatchRegionLabel, WATCH_REGION_OPTIONS } from '../watch-provider-types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface WatchRegionSelectorProps {
  value: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (regionCode: string) => void;
}

export function WatchRegionSelector({
  value,
  expanded,
  onToggleExpanded,
  onSelect,
}: WatchRegionSelectorProps) {
  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" muted>
        Watch region
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Watch region ${getWatchRegionLabel(value)}`}
        onPress={onToggleExpanded}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
        testID="watch-region-selector"
      >
        <AppText variant="body">{getWatchRegionLabel(value)}</AppText>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.options}>
          {WATCH_REGION_OPTIONS.map((option) => {
            const selected = option.code === value;

            return (
              <Pressable
                key={option.code}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
                onPress={() => onSelect(option.code)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodySmall" style={selected ? styles.optionLabelSelected : undefined}>
                  {option.label}
                </AppText>
                {selected ? (
                  <Ionicons name="checkmark" size={16} color={colors.accent} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  options: {
    gap: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.borderAccent,
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
