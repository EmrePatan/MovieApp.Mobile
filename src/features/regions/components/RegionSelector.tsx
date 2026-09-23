import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CircularFlagBadge } from '@/components/common/CircularFlagBadge';
import { getRegionFlagEmoji, getRegionLabel, REGION_OPTIONS } from '../region-options';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface RegionSelectorProps {
  label: string;
  value: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (regionCode: string) => void;
  testID?: string;
}

export function RegionSelector({
  label,
  value,
  expanded,
  onToggleExpanded,
  onSelect,
  testID,
}: RegionSelectorProps) {
  const regionLabel = getRegionLabel(value);

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" muted>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${label} ${regionLabel}`}
        onPress={onToggleExpanded}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
        testID={testID}
      >
        <View style={styles.selectorContent}>
          <CircularFlagBadge emoji={getRegionFlagEmoji(value)} />
          <AppText variant="body">{regionLabel}</AppText>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.options}>
          {REGION_OPTIONS.map((option) => {
            const selected = option.code === value;
            const optionLabel = getRegionLabel(option.code);

            return (
              <Pressable
                key={option.code}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={optionLabel}
                onPress={() => onSelect(option.code)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.optionContent}>
                  <CircularFlagBadge emoji={getRegionFlagEmoji(option.code)} />
                  <AppText variant="bodySmall" style={selected ? styles.optionLabelSelected : undefined}>
                    {optionLabel}
                  </AppText>
                </View>
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
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
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
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  optionLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
