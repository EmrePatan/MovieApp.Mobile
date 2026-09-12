import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface PasswordInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function PasswordInput({ label, error, style, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = props.nativeID ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={label}
          nativeID={inputId}
          {...props}
          secureTextEntry={!visible}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, error && styles.inputError, style]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible((current) => !current)}
          style={styles.toggle}
        >
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>
      {error ? (
        <AppText variant="caption" style={styles.error} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingRight: spacing.xxl,
    fontSize: typography.body.fontSize,
  },
  inputError: {
    borderColor: colors.error,
  },
  toggle: {
    position: 'absolute',
    right: spacing.sm,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  error: {
    color: colors.error,
  },
});
