import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface SearchEmptyStateProps {
  title: string;
  message?: string;
  variant?: 'initial' | 'results';
}

export function SearchEmptyState({
  title,
  message,
  variant = 'results',
}: SearchEmptyStateProps) {
  return (
    <View
      style={[styles.container, variant === 'initial' && styles.initial]}
      accessibilityRole="text"
    >
      <AppText variant="subtitle" center style={styles.title}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="bodySmall" muted center style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  initial: {
    paddingTop: spacing.xl,
  },
  title: {
    maxWidth: 320,
  },
  message: {
    maxWidth: 300,
    lineHeight: 20,
  },
});
