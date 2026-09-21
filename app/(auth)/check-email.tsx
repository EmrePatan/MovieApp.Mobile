import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import { AuthFormMessage } from '@/features/auth/components/AuthFormMessage';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthPrimaryButton } from '@/features/auth/components/AuthPrimaryButton';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { spacing } from '@/theme/spacing';

export default function CheckEmailScreen() {
  const { t } = useTranslation();
  const { resendVerification } = useAuth();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const emailParam = Array.isArray(params.email) ? params.email[0] : params.email;
  const email = emailParam?.trim() ?? '';

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleResend() {
    if (!email) {
      setFormError(t('auth.missingEmailRegisterAgain'));
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const message = await resendVerification(email);
      setSuccessMessage(message);
    } catch (error) {
      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'resend-verification'));
      } else {
        setFormError(t('auth.unableToResendVerification'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      taglineLines={[t('auth.checkEmailTagline1'), t('auth.checkEmailTagline2')]}
      headlineLines={[t('auth.checkEmailHeadline1'), t('auth.checkEmailHeadline2')]}
      headlineAccentLineIndex={1}
      supportingCopy={t('auth.checkEmailSupporting')}
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>{t('auth.alreadyVerified')}</AppText>
          <AuthLink label={t('auth.signIn')} href="/(auth)/login" />
        </View>
      }
    >
      <View style={styles.form}>
        {email ? (
          <AppText variant="bodySmall" style={styles.emailText}>
            {t('auth.verificationEmailSentTo', { email })}
          </AppText>
        ) : null}

        {successMessage ? <AuthFormMessage message={successMessage} tone="success" /> : null}
        {formError ? <AuthFormMessage message={formError} tone="error" /> : null}

        <AuthPrimaryButton
          title={t('auth.resendVerificationEmail')}
          onPress={() => void handleResend()}
          loading={isSubmitting}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  emailText: {
    color: 'rgba(245, 245, 247, 0.78)',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerText: {
    color: 'rgba(245, 245, 247, 0.72)',
  },
});
