import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

interface ReviewsPaginationControlProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function ReviewsPaginationControl({
  page,
  totalPages,
  onPrevious,
  onNext,
  isLoading = false,
}: ReviewsPaginationControlProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <View style={styles.container} testID="reviews-pagination-control">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous page"
        accessibilityState={{ disabled: !hasPreviousPage || isLoading }}
        disabled={!hasPreviousPage || isLoading}
        onPress={onPrevious}
        style={({ pressed }) => [
          styles.control,
          (!hasPreviousPage || isLoading) && styles.controlDisabled,
          pressed && hasPreviousPage && !isLoading && styles.pressed,
        ]}
        testID="reviews-pagination-previous"
      >
        <Ionicons
          name="chevron-back"
          size={14}
          color={hasPreviousPage && !isLoading ? colors.textSecondary : colors.textMuted}
        />
        <AppText
          variant="caption"
          style={[
            styles.controlLabel,
            (!hasPreviousPage || isLoading) && styles.controlLabelDisabled,
          ]}
        >
          Previous
        </AppText>
      </Pressable>

      <AppText variant="caption" muted style={styles.pageLabel} testID="reviews-pagination-label">
        {page} / {totalPages}
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next page"
        accessibilityState={{ disabled: !hasNextPage || isLoading }}
        disabled={!hasNextPage || isLoading}
        onPress={onNext}
        style={({ pressed }) => [
          styles.control,
          (!hasNextPage || isLoading) && styles.controlDisabled,
          pressed && hasNextPage && !isLoading && styles.pressed,
        ]}
        testID="reviews-pagination-next"
      >
        <AppText
          variant="caption"
          style={[
            styles.controlLabel,
            (!hasNextPage || isLoading) && styles.controlLabelDisabled,
          ]}
        >
          Next
        </AppText>
        <Ionicons
          name="chevron-forward"
          size={14}
          color={hasNextPage && !isLoading ? colors.textSecondary : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: interaction.touchTarget,
    paddingHorizontal: spacing.xs,
  },
  controlDisabled: {
    opacity: 0.35,
  },
  controlLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
  },
  controlLabelDisabled: {
    color: colors.textMuted,
  },
  pageLabel: {
    minWidth: 44,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
    color: colors.textMuted,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
