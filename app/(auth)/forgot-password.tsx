import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { forgotPasswordRequest } from '@/auth/auth-api';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  hasValidationErrors,
  validateForgotPasswordForm,
  type ForgotPasswordFormErrors,
} from '@/utils/validation';
import { AUTH_FORGOT_PASSWORD_COPY } from '@/features/auth/auth-copy';
import { AuthFormMessage } from '@/features/auth/components/AuthFormMessage';
import { AuthInput } from '@/features/auth/components/AuthInput';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthPrimaryButton } from '@/features/auth/components/AuthPrimaryButton';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
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
      taglineLines={AUTH_FORGOT_PASSWORD_COPY.taglineLines}
      headlineLines={AUTH_FORGOT_PASSWORD_COPY.headlineLines}
      headlineAccentLineIndex={AUTH_FORGOT_PASSWORD_COPY.headlineAccentLineIndex}
      supportingCopy={AUTH_FORGOT_PASSWORD_COPY.supportingCopy}
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>Remembered it?</AppText>
          <AuthLink label="Back to sign in" href="/(auth)/login" />
        </View>
      }
    >
      <View style={styles.form}>
        <AuthInput
          placeholder="Email"
          leadingIcon="email"
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

        {successMessage ? <AuthFormMessage message={successMessage} tone="success" /> : null}

        {formError ? <AuthFormMessage message={formError} tone="error" /> : null}

        <AuthPrimaryButton
          title="Send reset instructions"
          onPress={() => void handleSubmit()}
          loading={isSubmitting}
        />

        <View style={styles.secondaryLink}>
          <AuthLink label="Create an account" href="/(auth)/register" accent={false} />
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  footerText: {
    color: 'rgba(245, 245, 247, 0.72)',
  },
  secondaryLink: {
    alignItems: 'center',
  },
});
