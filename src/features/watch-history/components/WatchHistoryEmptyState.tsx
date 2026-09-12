import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { spacing } from '@/theme/spacing';

interface WatchHistoryEmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function WatchHistoryEmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: WatchHistoryEmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="bodySmall" muted style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton title={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
