import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { forgotPasswordRequest } from '@/auth/auth-api';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  hasValidationErrors,
  validateForgotPasswordForm,
  type ForgotPasswordFormErrors,
} from '@/utils/validation';
import { AuthFormMessage } from '@/features/auth/components/AuthFormMessage';
import { AuthInput } from '@/features/auth/components/AuthInput';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthPrimaryButton } from '@/features/auth/components/AuthPrimaryButton';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { spacing } from '@/theme/spacing';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
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
        setFormError(t('auth.unableToProcessRequest'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      taglineLines={[t('auth.forgotPasswordTagline1'), t('auth.forgotPasswordTagline2')]}
      headlineLines={[t('auth.forgotPasswordHeadline1'), t('auth.forgotPasswordHeadline2')]}
      headlineAccentLineIndex={1}
      supportingCopy={t('auth.forgotPasswordSupporting')}
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>{t('auth.rememberedIt')}</AppText>
          <AuthLink label={t('common.backToSignIn')} href="/(auth)/login" />
        </View>
      }
    >
      <View style={styles.form}>
        <AuthInput
          placeholder={t('auth.email')}
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
          title={t('auth.sendResetInstructions')}
          onPress={() => void handleSubmit()}
          loading={isSubmitting}
        />

        <View style={styles.secondaryLink}>
          <AuthLink label={t('auth.createAnAccount')} href="/(auth)/register" accent={false} />
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
