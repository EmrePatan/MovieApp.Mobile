import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

interface ReviewsEmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionAccessibilityLabel?: string;
  accessibilityLabel?: string;
  testID?: string;
}

export function ReviewsEmptyState({
  title,
  message,
  actionLabel,
  onAction,
  actionAccessibilityLabel,
  accessibilityLabel,
  testID = 'reviews-empty-state',
}: ReviewsEmptyStateProps) {
  const showAction = Boolean(actionLabel && onAction);

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? [title, message].filter(Boolean).join('. ')}
      testID={testID}
    >
      <View style={styles.iconWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.textMuted} />
      </View>
      <AppText variant="subtitle" center style={styles.title}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="bodySmall" muted center style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {showAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          testID="reviews-empty-state-action"
        >
          <AppText variant="caption" style={styles.actionLabel}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: layout.screenPaddingHorizontal,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
  },
  message: {
    maxWidth: 280,
  },
  actionButton: {
    marginTop: spacing.xs,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  actionLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
