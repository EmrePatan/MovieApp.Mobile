import type { HomeTypeFilter } from '../types';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const FILTERS: { label: string; value: HomeTypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' },
];

interface HomeTypeFilterControlProps {
  value: HomeTypeFilter;
  onChange: (value: HomeTypeFilter) => void;
  overlay?: boolean;
}

export function HomeTypeFilterControl({
  value,
  onChange,
  overlay = false,
}: HomeTypeFilterControlProps) {
  return (
    <View
      style={[styles.container, overlay && styles.containerOverlay]}
      accessibilityRole="tablist"
    >
      {FILTERS.map((filter) => {
        const selected = value === filter.value;

        return (
          <Pressable
            key={filter.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`Show ${filter.label}`}
            onPress={() => onChange(filter.value)}
            style={[
              styles.chip,
              overlay && styles.chipOverlay,
              selected && styles.chipSelected,
              selected && overlay && styles.chipSelectedOverlay,
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.label,
                overlay && styles.labelOverlay,
                selected && styles.labelSelected,
              ]}
            >
              {filter.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  containerOverlay: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOverlay: {
    minHeight: 32,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: 'rgba(20, 20, 28, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipSelectedOverlay: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelOverlay: {
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
