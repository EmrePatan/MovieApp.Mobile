import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ForgotPasswordScreen() {
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
    <AuthScreenLayout
      eyebrow="Need a reset"
      title="Forgot password"
      subtitle="Enter your email and we will send reset instructions if an account exists."
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" muted>Remembered it?</AppText>
          <AuthLink label="Back to sign in" href="/(auth)/login" />
        </View>
      }
    >
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

        <AuthLink
          label="Create an account"
          href="/(auth)/register"
          accent={false}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  formError: {
    color: colors.error,
  },
  successMessage: {
    color: colors.success,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
