import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface AuthFormMessageProps {
  message: string;
  tone: 'error' | 'success';
}

export function AuthFormMessage({ message, tone }: AuthFormMessageProps) {
  const isError = tone === 'error';

  return (
    <View
      style={[styles.banner, isError ? styles.errorBanner : styles.successBanner]}
      accessibilityRole="alert"
    >
      <AppText variant="bodySmall" style={isError ? styles.errorText : styles.successText}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorBanner: {
    backgroundColor: colors.errorTint15,
    borderColor: 'rgba(255, 77, 79, 0.35)',
  },
  successBanner: {
    backgroundColor: colors.successTint12,
    borderColor: 'rgba(76, 175, 130, 0.35)',
  },
  errorText: {
    color: '#FFB4B4',
    lineHeight: 20,
  },
  successText: {
    color: colors.success,
    lineHeight: 20,
  },
});
