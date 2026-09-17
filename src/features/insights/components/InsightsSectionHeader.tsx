import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { spacing } from '@/theme/spacing';

interface InsightsSectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function InsightsSectionHeader({ title, subtitle }: InsightsSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" muted>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
    marginBottom: spacing.xs,
  },
  title: {
    letterSpacing: 0.2,
  },
});
