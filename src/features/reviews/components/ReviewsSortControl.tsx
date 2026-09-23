import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { ReviewSortOption } from '../types';
import { getReviewSortLabel, REVIEW_SORT_OPTIONS } from '../utils/review-sort';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';

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
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.sortByLabel', { label: currentLabel })}
        onPress={openSortMenu}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
        testID="reviews-sort-control"
      >
        <AppText variant="caption" style={styles.label} numberOfLines={1}>
          {currentLabel}
        </AppText>
        <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  selector: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: interaction.touchTarget,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: colors.surface,
    maxWidth: '100%',
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    flexShrink: 1,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
