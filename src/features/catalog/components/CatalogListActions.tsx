import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface CatalogListActionsProps {
  sortActive: boolean;
  filterActive: boolean;
  sortAccessibilityLabel: string;
  filterAccessibilityLabel: string;
  onPressSort: () => void;
  onPressFilter: () => void;
  testID?: string;
}

export function CatalogListActions({
  sortActive,
  filterActive,
  sortAccessibilityLabel,
  filterAccessibilityLabel,
  onPressSort,
  onPressFilter,
  testID,
}: CatalogListActionsProps) {
  return (
    <View style={styles.row} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sortAccessibilityLabel}
        accessibilityState={{ selected: sortActive }}
        onPress={onPressSort}
        hitSlop={8}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        testID={testID ? `${testID}-sort` : undefined}
      >
        <Ionicons
          name="swap-vertical-outline"
          size={22}
          color={sortActive ? colors.accent : colors.textPrimary}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={filterAccessibilityLabel}
        accessibilityState={{ selected: filterActive }}
        onPress={onPressFilter}
        hitSlop={8}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        testID={testID ? `${testID}-filter` : undefined}
      >
        <Ionicons
          name="filter-outline"
          size={22}
          color={filterActive ? colors.accent : colors.textPrimary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  action: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
