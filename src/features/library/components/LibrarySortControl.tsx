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
  appearance?: 'filled' | 'outlined';
  showLabel?: boolean;
}

export function LibrarySortControl({
  value,
  options,
  onChange,
  appearance = 'filled',
  showLabel = false,
}: LibrarySortControlProps) {
  if (options.length <= 1) {
    return null;
  }

  const isOutlined = appearance === 'outlined';

  return (
    <View style={styles.wrapper}>
      {showLabel ? (
        <View style={styles.labelRow}>
          <Ionicons name="swap-vertical-outline" size={14} color={colors.textMuted} />
          <AppText variant="caption" muted>
            Sort
          </AppText>
        </View>
      ) : null}
      <View style={styles.container} accessibilityRole="tablist">
        {options.map((option) => {
          const selected = value === option;

          return (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`Sort by ${getSortLabel(option)}`}
              onPress={() => onChange(option)}
              style={[
                styles.chip,
                isOutlined ? styles.chipOutlined : styles.chipFilled,
                selected &&
                  (isOutlined ? styles.chipOutlinedSelected : styles.chipFilledSelected),
              ]}
            >
              <AppText
                variant="caption"
                style={[
                  styles.label,
                  selected &&
                    (isOutlined ? styles.labelOutlinedSelected : styles.labelFilledSelected),
                ]}
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
  wrapper: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipFilled: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipFilledSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipOutlined: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  chipOutlinedSelected: {
    backgroundColor: colors.accentTint12,
    borderColor: colors.borderAccent,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelFilledSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  labelOutlinedSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
