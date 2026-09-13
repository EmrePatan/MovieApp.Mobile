import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileInsightStripProps {
  insights: string[];
}

export function ProfileInsightStrip({ insights }: ProfileInsightStripProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="summary">
      {insights.map((insight) => (
        <View key={insight} style={styles.chip}>
          <AppText variant="bodySmall" style={styles.text}>
            {insight}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.accentTint12,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentTint18,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: colors.textPrimary,
  },
});
