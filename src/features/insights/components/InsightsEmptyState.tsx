import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { spacing } from '@/theme/spacing';

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
    paddingVertical: spacing.sm,
  },
});
