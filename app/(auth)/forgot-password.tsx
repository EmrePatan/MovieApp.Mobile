import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { forgotPasswordRequest } from '@/auth/auth-api';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  hasValidationErrors,
  validateForgotPasswordForm,
  type ForgotPasswordFormErrors,
} from '@/utils/validation';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const errors = validateForgotPasswordForm(email);
    setFieldErrors(errors);

    if (hasValidationErrors(errors)) {
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await forgotPasswordRequest({ email: email.trim() });
      setSuccessMessage(response.message);
    } catch (error) {
      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'forgot-password'));
      } else {
        setFormError('Unable to process your request. Please try again.');
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
          <AppText variant="title">Forgot password</AppText>
          <AppText variant="body" muted center>
            Enter your email and we&apos;ll send reset instructions if an account exists.
          </AppText>
        </View>

        <View style={styles.form}>
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={fieldErrors.email}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
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

          <AppButton
            title="Send reset instructions"
            onPress={() => void handleSubmit()}
            loading={isSubmitting}
          />

          <AppButton title="Back to sign in" variant="secondary" onPress={() => router.replace('/(auth)/login')} />

          <Link href="/(auth)/register" asChild>
            <AppButton title="Create an account" variant="secondary" />
          </Link>
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
