import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { LibraryCategory } from '../types/library';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const CATEGORIES: { label: string; value: LibraryCategory }[] = [
  { label: 'Watching', value: 'watching' },
  { label: 'Watched', value: 'watched' },
  { label: 'Liked', value: 'liked' },
  { label: 'Watchlist', value: 'watchlist' },
];

interface LibraryCategoryControlProps {
  value: LibraryCategory;
  onChange: (value: LibraryCategory) => void;
}

export function LibraryCategoryControl({ value, onChange }: LibraryCategoryControlProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {CATEGORIES.map((category) => {
        const selected = value === category.value;

        return (
          <Pressable
            key={category.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${category.label} category`}
            onPress={() => onChange(category.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <AppText
              variant="caption"
              style={[styles.label, selected && styles.labelSelected]}
            >
              {category.label}
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
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
