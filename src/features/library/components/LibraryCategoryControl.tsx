import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { translateLibraryCategory } from '@/i18n/catalog-labels';
import type { LibraryCategory } from '../types/library';
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
    alignItems: 'flex-end',
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: premiumSheet.border,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -StyleSheet.hairlineWidth,
  },
  chipSelected: {
    borderBottomColor: premiumSheet.goldBorder,
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

