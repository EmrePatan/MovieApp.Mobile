import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
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
        placeholderTextColor={colors.textMuted}
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
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
