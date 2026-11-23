import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { translateLibraryCategory } from '@/i18n/catalog-labels';
import type { LibraryCategory } from '../types/library';
import { glass } from '@/theme/glass';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

const CATEGORY_VALUES: LibraryCategory[] = ['watching', 'watched', 'liked', 'watchlist'];

interface LibraryCategoryControlProps {
  value: LibraryCategory;
  onChange: (value: LibraryCategory) => void;
}

export function LibraryCategoryControl({ value, onChange }: LibraryCategoryControlProps) {
  const { t } = useTranslation();
  const categories = useMemo(
    () =>
      CATEGORY_VALUES.map((categoryValue) => ({
        value: categoryValue,
        label: translateLibraryCategory(categoryValue),
      })),
    [t],
  );

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {categories.map((category) => {
        const selected = value === category.value;

        return (
          <Pressable
            key={category.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t('library.categories.categoryAccessibility', {
              label: category.label,
            })}
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
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panel,
  },
  chipSelected: {
    borderColor: glass.accentBorder,
    backgroundColor: glass.accentFill,
  },
  label: {
    color: premiumSheet.textSecondary,
    fontWeight: '500',
  },
  labelSelected: {
    color: premiumSheet.textPrimary,
    fontWeight: '700',
  },
});

