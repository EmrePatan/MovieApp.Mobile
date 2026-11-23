import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileEmptyInsightProps {
  message: string;
}

export function ProfileEmptyInsight({ message }: ProfileEmptyInsightProps) {
  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" muted center>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
    backgroundColor: glass.panel,
  },
});
