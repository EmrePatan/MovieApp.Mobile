import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface LoadingViewProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingView({ message, fullScreen = true }: LoadingViewProps) {
  const { t } = useTranslation();
  const resolvedMessage = message ?? t('common.loading');

  return (
    <View
      style={[styles.container, fullScreen && styles.fullScreen]}
      accessibilityRole="progressbar"
      accessibilityLabel={resolvedMessage}
    >
      <ActivityIndicator size="large" color={colors.accent} />
      <AppText variant="bodySmall" muted center style={styles.message}>
        {resolvedMessage}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    marginTop: spacing.sm,
  },
});
