import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';

interface DetailNotFoundProps {
  title: string;
  message: string;
}

export function DetailNotFound({ title, message }: DetailNotFoundProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      <AppText variant="bodySmall" muted center style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panel,
    gap: spacing.sm,
  },
  message: {
    marginTop: spacing.xs,
  },
});
