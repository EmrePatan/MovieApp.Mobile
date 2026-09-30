import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface FilterSelectorRowProps {
  label: string;
  valueLabel: string;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

export function FilterSelectorRow({
  label,
  valueLabel,
  onPress,
  accessibilityLabel,
  testID,
}: FilterSelectorRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label}, ${valueLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={testID}
    >
      <AppText variant="body">{label}</AppText>
      <View style={styles.valueRow}>
        <AppText variant="bodySmall" muted numberOfLines={1} style={styles.value}>
          {valueLabel}
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
    maxWidth: '58%',
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
  pressed: {
    opacity: 0.85,
  },
});
