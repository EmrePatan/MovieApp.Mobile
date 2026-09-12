import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { spacing } from '@/theme/spacing';

interface WatchlistEmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function WatchlistEmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: WatchlistEmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      {message ? (
        <AppText variant="bodySmall" muted center>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton title={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  button: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
});
