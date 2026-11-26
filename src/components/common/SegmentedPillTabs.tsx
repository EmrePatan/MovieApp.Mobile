import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { glass } from '@/theme/glass';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

export interface SegmentedPillTabOption<Value extends string> {
  value: Value;
  label: string;
  accessibilityLabel?: string;
  testID?: string;
}

interface SegmentedPillTabsProps<Value extends string> {
  options: readonly SegmentedPillTabOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}

/** The compact pill track of the social feed, shared by every full-width segment control. */
export function SegmentedPillTabs<Value extends string>({
  options,
  value,
  onChange,
}: SegmentedPillTabsProps<Value>) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            onPress={() => onChange(option.value)}
            style={[styles.tab, active && styles.tabActive]}
            hitSlop={{ top: 6, bottom: 6 }}
            testID={option.testID}
          >
            <AppText style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {option.label}
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
    alignItems: 'stretch',
    alignSelf: 'stretch',
    gap: 2,
    padding: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panelInput,
  },
  tab: {
    flex: 1,
    // Minimum only, so larger system text can grow the pill instead of being clipped.
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: glass.accentFill,
    borderColor: glass.accentBorder,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: premiumSheet.textSecondary,
    textAlign: 'center',
  },
  labelActive: { color: premiumSheet.textPrimary },
});
