import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { commonStyles } from '@/theme/theme';
import { spacing } from '@/theme/spacing';

interface ErrorViewProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorView({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}: ErrorViewProps) {
  return (
    <View style={[commonStyles.surfaceCardCentered, styles.container]} accessibilityRole="alert">
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      <AppText variant="bodySmall" muted center>
        {message}
      </AppText>
      {onRetry ? (
        <AppButton
          title={retryLabel}
          onPress={onRetry}
          variant="secondary"
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
});
