import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { commonStyles } from '@/theme/theme';
import { spacing } from '@/theme/spacing';

interface EmptyViewProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  bordered?: boolean;
  centered?: boolean;
}

export function EmptyView({
  title,
  message,
  actionLabel,
  onAction,
  bordered = true,
  centered = false,
}: EmptyViewProps) {
  return (
    <View
      style={[
        bordered ? commonStyles.surfaceCardCentered : styles.plain,
        centered && styles.centered,
      ]}
      accessibilityRole="text"
    >
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      {message ? (
        <AppText variant="bodySmall" muted center style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton title={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  plain: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    maxWidth: 320,
  },
  action: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
});
