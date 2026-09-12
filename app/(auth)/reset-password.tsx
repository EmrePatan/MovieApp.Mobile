import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { resetPasswordRequest } from '@/auth/auth-api';
import { parseResetPasswordTokenParam } from '@/auth/reset-password-utils';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  hasValidationErrors,
  validateResetPasswordForm,
  type ResetPasswordFormErrors,
} from '@/utils/validation';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const deepLinkToken = useMemo(
    () => parseResetPasswordTokenParam(params.token),
    [params.token],
  );
  const tokenFromDeepLink = deepLinkToken.length > 0;

  const [manualToken, setManualToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeToken = tokenFromDeepLink ? deepLinkToken : manualToken.trim();

  async function handleSubmit() {
    const errors = validateResetPasswordForm(activeToken, newPassword, confirmPassword);
    setFieldErrors(errors);

    if (hasValidationErrors(errors)) {
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await resetPasswordRequest({
        token: activeToken,
        newPassword,
      });
      setSuccessMessage(response.message);
      setManualToken('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    } catch (error) {
      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'reset-password'));
      } else {
        setFormError('Unable to reset your password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <AppText variant="title">Reset password</AppText>
          <AppText variant="body" muted center>
            {tokenFromDeepLink
              ? 'Choose a new password to finish resetting your account.'
              : 'Enter the reset token from your email and choose a new password.'}
          </AppText>
        </View>

        <View style={styles.form}>
          {!tokenFromDeepLink ? (
            <AppInput
              label="Reset token"
              value={manualToken}
              onChangeText={setManualToken}
              error={fieldErrors.token}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="oneTimeCode"
              returnKeyType="next"
            />
          ) : null}

          <AppInput
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            error={fieldErrors.newPassword}
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
            returnKeyType="next"
          />
          <AppInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={fieldErrors.confirmPassword}
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={() => void handleSubmit()}
          />

          {successMessage ? (
            <AppText variant="bodySmall" style={styles.successMessage} accessibilityRole="alert">
              {successMessage}
            </AppText>
          ) : null}

          {formError ? (
            <AppText variant="bodySmall" style={styles.formError} accessibilityRole="alert">
              {formError}
            </AppText>
          ) : null}

          <AppButton title="Reset password" onPress={() => void handleSubmit()} loading={isSubmitting} />

          <AppButton title="Back to sign in" variant="secondary" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  formError: {
    color: colors.error,
  },
  successMessage: {
    color: colors.success,
  },
});
