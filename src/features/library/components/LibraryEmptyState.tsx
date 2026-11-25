import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { authTypography } from '@/features/auth/auth-typography';
import type { LibraryRemoveIcon } from '../types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface LibraryEmptyStateProps {
  icon?: LibraryRemoveIcon | 'library';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function LibraryEmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: LibraryEmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="text">
      <AppText style={styles.title} center>
        {title}
      </AppText>
      {message ? (
        <AppText style={styles.message} center>
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
  title: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 26,
    lineHeight: 30,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  message: {
    fontFamily: authTypography.editorialRegular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
});
