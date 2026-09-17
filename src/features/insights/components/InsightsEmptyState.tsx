import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsEmptyStateProps {
  message: string;
  accessibilityLabel?: string;
}

export function InsightsEmptyState({ message, accessibilityLabel }: InsightsEmptyStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? message}
    >
      <AppText variant="bodySmall" muted>
        {message}
      </AppText>
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
  },
});
