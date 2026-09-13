import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { getSortLabel } from '../utils/library-sort';
import type { LibrarySortOption } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibrarySortControlProps {
  value: LibrarySortOption;
  options: LibrarySortOption[];
  onChange: (value: LibrarySortOption) => void;
}

export function LibrarySortControl({ value, options, onChange }: LibrarySortControlProps) {
  if (options.length <= 1) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="menu">
      <View style={styles.labelRow}>
        <Ionicons name="swap-vertical-outline" size={14} color={colors.textMuted} />
        <AppText variant="caption" muted>
          Sort
        </AppText>
      </View>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = value === option;

          return (
            <Pressable
              key={option}
              accessibilityRole="menuitem"
              accessibilityState={{ selected }}
              accessibilityLabel={`Sort by ${getSortLabel(option)}`}
              onPress={() => onChange(option)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <AppText
                variant="caption"
                style={[styles.chipLabel, selected && styles.chipLabelSelected]}
              >
                {getSortLabel(option)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.textSecondary,
    backgroundColor: colors.surfaceElevated,
  },
  chipLabel: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
