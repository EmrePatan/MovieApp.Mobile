import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
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
          styles.button,
          (!hasPreviousPage || isLoading) && styles.buttonDisabled,
          pressed && hasPreviousPage && !isLoading && styles.pressed,
        ]}
        testID="reviews-pagination-previous"
      >
        <Ionicons
          name="chevron-back"
          size={16}
          color={hasPreviousPage ? colors.textPrimary : colors.textMuted}
        />
        <AppText
          variant="caption"
          style={[styles.buttonLabel, !hasPreviousPage && styles.buttonLabelDisabled]}
        >
          Previous
        </AppText>
      </Pressable>

      <AppText variant="caption" muted style={styles.pageLabel} testID="reviews-pagination-label">
        Page {page} of {totalPages}
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next page"
        accessibilityState={{ disabled: !hasNextPage || isLoading }}
        disabled={!hasNextPage || isLoading}
        onPress={onNext}
        style={({ pressed }) => [
          styles.button,
          (!hasNextPage || isLoading) && styles.buttonDisabled,
          pressed && hasNextPage && !isLoading && styles.pressed,
        ]}
        testID="reviews-pagination-next"
      >
        <AppText
          variant="caption"
          style={[styles.buttonLabel, !hasNextPage && styles.buttonLabelDisabled]}
        >
          Next
        </AppText>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={hasNextPage ? colors.textPrimary : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: interaction.touchTarget,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  buttonLabelDisabled: {
    color: colors.textMuted,
  },
  pageLabel: {
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
