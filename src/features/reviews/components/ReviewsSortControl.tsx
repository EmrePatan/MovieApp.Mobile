import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { ReviewSortOption } from '../types';
import { getReviewSortLabel, REVIEW_SORT_OPTIONS } from '../utils/review-sort';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';

interface ReviewsSortControlProps {
  value: ReviewSortOption;
  onChange: (value: ReviewSortOption) => void;
}

export function ReviewsSortControl({ value, onChange }: ReviewsSortControlProps) {
  const { t } = useTranslation();
  const currentLabel = getReviewSortLabel(value);

  const openSortMenu = () => {
    Alert.alert(
      t('common.sortBy'),
      undefined,
      [
        ...REVIEW_SORT_OPTIONS.map((option) => ({
          text: getReviewSortLabel(option),
          onPress: () => onChange(option),
        })),
        { text: t('common.cancel'), style: 'cancel' },
      ],
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('common.sortByLabel', { label: currentLabel })}
      onPress={openSortMenu}
      style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
      testID="reviews-sort-control"
    >
      <AppText variant="caption" muted style={styles.sortPrefix} numberOfLines={1}>
        {t('common.sortBy')}
      </AppText>
      <AppText variant="caption" style={styles.activeLabel} numberOfLines={1}>
        {currentLabel}
      </AppText>
      <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: interaction.touchTarget,
    justifyContent: 'flex-end',
    paddingLeft: spacing.sm,
    flexShrink: 0,
    maxWidth: '62%',
  },
  sortPrefix: {
    fontSize: 11,
    lineHeight: 14,
    flexShrink: 0,
  },
  activeLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    flexShrink: 1,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
