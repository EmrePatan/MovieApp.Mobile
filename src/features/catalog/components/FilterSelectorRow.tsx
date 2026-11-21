import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CircularFlagBadge } from '@/components/common/CircularFlagBadge';
import { AppText } from '@/components/common/AppText';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

interface FilterSelectorRowProps {
  label: string;
  valueLabel: string;
  valueFlagEmoji?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

export function FilterSelectorRow({
  label,
  valueLabel,
  valueFlagEmoji,
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
      <AppText variant="body" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.valueRow}>
        {valueFlagEmoji ? <CircularFlagBadge emoji={valueFlagEmoji} /> : null}
        <AppText variant="bodySmall" numberOfLines={1} style={styles.value}>
          {valueLabel}
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={premiumSheet.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    backgroundColor: premiumSheet.secondary,
  },
  label: {
    color: premiumSheet.textPrimary,
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
    color: premiumSheet.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
