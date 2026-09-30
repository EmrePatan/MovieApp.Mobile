import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ExpandableAdvancedFiltersProps {
  title: string;
  expanded: boolean;
  hasActiveFilters: boolean;
  onToggle: () => void;
  children: ReactNode;
  testID?: string;
}

export function ExpandableAdvancedFilters({
  title,
  expanded,
  hasActiveFilters,
  onToggle,
  children,
  testID,
}: ExpandableAdvancedFiltersProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={title}
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={styles.titleRow}>
          <AppText variant="body" style={styles.title}>
            {title}
          </AppText>
          {!expanded && hasActiveFilters ? <View style={styles.activeDot} /> : null}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </Pressable>
      {expanded ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
