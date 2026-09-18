import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInput(
  { label, error, style, ...props },
  ref,
) {
  const inputId = props.nativeID ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        nativeID={inputId}
        placeholderTextColor="rgba(161, 161, 181, 0.72)"
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error ? (
        <AppText variant="caption" style={styles.error} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    color: 'rgba(245, 245, 247, 0.82)',
  },
  input: {
    backgroundColor: 'rgba(12, 12, 18, 0.58)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    color: colors.textPrimary,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
  },
});
