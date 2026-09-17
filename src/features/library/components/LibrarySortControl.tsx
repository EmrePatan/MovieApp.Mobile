import { Alert, Pressable, StyleSheet, View } from 'react-native';
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
  variant?: 'chips' | 'menu';
}

export function LibrarySortControl({
  value,
  options,
  onChange,
  variant = 'chips',
}: LibrarySortControlProps) {
  if (options.length <= 1) {
    return null;
  }

  if (variant === 'menu') {
    const handlePress = () => {
      Alert.alert(
        'Sort by',
        undefined,
        [
          ...options.map((option) => ({
            text: getSortLabel(option),
            onPress: () => onChange(option),
          })),
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    };

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Sort by ${getSortLabel(value)}`}
        accessibilityHint="Opens sort options"
        onPress={handlePress}
        style={({ pressed }) => [styles.menuTrigger, pressed && styles.menuPressed]}
      >
        <AppText variant="caption" muted>
          Sort:
        </AppText>
        <AppText variant="caption" style={styles.menuValue}>
          {getSortLabel(value)}
        </AppText>
        <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
      </Pressable>
    );
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
  menuTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  menuPressed: {
    opacity: 0.85,
  },
  menuValue: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
