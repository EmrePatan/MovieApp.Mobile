import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import { AUTH_CHECK_EMAIL_COPY } from '@/features/auth/auth-copy';
import { AuthFormMessage } from '@/features/auth/components/AuthFormMessage';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthPrimaryButton } from '@/features/auth/components/AuthPrimaryButton';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { spacing } from '@/theme/spacing';

export default function CheckEmailScreen() {
  const { resendVerification } = useAuth();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const emailParam = Array.isArray(params.email) ? params.email[0] : params.email;
  const email = emailParam?.trim() ?? '';

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleResend() {
    if (!email) {
      setFormError('Missing email address. Please register again.');
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
        setFormError('Unable to resend the verification email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      taglineLines={AUTH_CHECK_EMAIL_COPY.taglineLines}
      headlineLines={AUTH_CHECK_EMAIL_COPY.headlineLines}
      headlineAccentLineIndex={AUTH_CHECK_EMAIL_COPY.headlineAccentLineIndex}
      supportingCopy={AUTH_CHECK_EMAIL_COPY.supportingCopy}
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>Already verified?</AppText>
          <AuthLink label="Sign in" href="/(auth)/login" />
        </View>
      }
    >
      <View style={styles.form}>
        {email ? (
          <AppText variant="bodySmall" style={styles.emailText}>
            Verification email sent to {email}
          </AppText>
        ) : null}

        {successMessage ? <AuthFormMessage message={successMessage} tone="success" /> : null}
        {formError ? <AuthFormMessage message={formError} tone="error" /> : null}

        <AuthPrimaryButton
          title="Resend verification email"
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
    gap: spacing.xs,
  },
  footerText: {
    color: 'rgba(245, 245, 247, 0.72)',
  },
});
