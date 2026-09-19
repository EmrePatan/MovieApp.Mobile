import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export type FeedbackTone = 'success' | 'error' | 'info';

interface FeedbackMessageProps {
  message: string | null;
  tone?: FeedbackTone;
  onDismiss?: () => void;
}

export function FeedbackMessage({
  message,
  tone = 'info',
  onDismiss,
}: FeedbackMessageProps) {
  const { t } = useTranslation();

  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, styles[tone]]} accessibilityLiveRegion="polite">
      <AppText variant="bodySmall" style={styles.text}>
        {message}
      </AppText>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.dismissMessage')}
          onPress={onDismiss}
          hitSlop={8}
        >
          <AppText variant="bodySmall" style={styles.text}>
            ×
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  success: {
    backgroundColor: colors.successTint15,
    borderWidth: 1,
    borderColor: colors.success,
  },
  error: {
    backgroundColor: colors.errorTint15,
    borderWidth: 1,
    borderColor: colors.error,
  },
  info: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    flex: 1,
    color: colors.textPrimary,
  },
});
