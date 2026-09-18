import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface InsightsSectionHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}

export function InsightsSectionHeader({ title, subtitle, trailing }: InsightsSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <AppText variant="subtitle" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySmall" muted style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    letterSpacing: 0.2,
    color: colors.textPrimary,
  },
  subtitle: {
    lineHeight: 20,
  },
  trailing: {
    paddingTop: 2,
  },
});
