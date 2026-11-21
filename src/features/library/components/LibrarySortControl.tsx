import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { getSortLabel } from '../utils/library-sort';
import type { LibrarySortOption } from '../types';
import { premiumSheet } from '@/theme/premium-sheet';
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
  const { t } = useTranslation();

  if (options.length <= 1) {
    return null;
  }

  const isOutlined = appearance === 'outlined';

  return (
    <View style={styles.wrapper}>
      {showLabel ? (
        <View style={styles.labelRow}>
          <Ionicons name="swap-vertical-outline" size={14} color={premiumSheet.textSecondary} />
          <AppText variant="caption" muted>
            {t('common.sortBy')}
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
              accessibilityLabel={t('common.sortByLabel', { label: getSortLabel(option) })}
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
    borderColor: premiumSheet.rowBorder,
    backgroundColor: premiumSheet.secondary,
  },
  chipFilledSelected: {
    backgroundColor: premiumSheet.elevated,
    borderColor: premiumSheet.goldBorder,
  },
  chipOutlined: {
    borderColor: premiumSheet.rowBorder,
    backgroundColor: premiumSheet.elevated,
  },
  chipOutlinedSelected: {
    backgroundColor: premiumSheet.elevated,
    borderColor: premiumSheet.goldBorder,
  },
  label: {
    color: premiumSheet.textSecondary,
    fontWeight: '500',
  },
  labelFilledSelected: {
    color: premiumSheet.mutedGold,
    fontWeight: '600',
  },
  labelOutlinedSelected: {
    color: premiumSheet.mutedGold,
    fontWeight: '600',
  },
});

