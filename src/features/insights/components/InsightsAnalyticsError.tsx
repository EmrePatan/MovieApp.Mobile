import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsAnalyticsErrorProps {
  message: string;
  onRetry: () => void;
}

export function InsightsAnalyticsError({ message, onRetry }: InsightsAnalyticsErrorProps) {
  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" muted>
        {message}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retry loading analytics"
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
      >
        <AppText variant="bodySmall" style={styles.retryLabel}>Retry analytics</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  retryLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
