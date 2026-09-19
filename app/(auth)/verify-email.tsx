import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { parseVerifyEmailTokenParam } from '@/auth/verify-email-utils';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import { AUTH_VERIFY_EMAIL_COPY } from '@/features/auth/auth-copy';
import { AuthFormMessage } from '@/features/auth/components/AuthFormMessage';
import { AuthInput } from '@/features/auth/components/AuthInput';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthPrimaryButton } from '@/features/auth/components/AuthPrimaryButton';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { spacing } from '@/theme/spacing';

export default function VerifyEmailScreen() {
  const { verifyEmail } = useAuth();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const deepLinkToken = useMemo(() => parseVerifyEmailTokenParam(params.token), [params.token]);
  const tokenFromDeepLink = deepLinkToken.length > 0;

  const [manualToken, setManualToken] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  const activeToken = tokenFromDeepLink ? deepLinkToken : manualToken.trim();

  async function handleSubmit() {
    if (!activeToken) {
      setFormError('Verification token is required.');
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await verifyEmail(activeToken);
      setSuccessMessage('Email verified. Welcome to MovieApp.');
    } catch (error) {
      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'verify-email'));
      } else {
        setFormError('Unable to verify your email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!tokenFromDeepLink || hasAutoSubmitted) {
      return;
    }

    setHasAutoSubmitted(true);

    void (async () => {
      setFormError(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      try {
        await verifyEmail(deepLinkToken);
        setSuccessMessage('Email verified. Welcome to MovieApp.');
      } catch (error) {
        if (isApiError(error)) {
          setFormError(getUserMessageForAuthError(error.kind, 'verify-email'));
        } else {
          setFormError('Unable to verify your email. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [tokenFromDeepLink, hasAutoSubmitted, deepLinkToken, verifyEmail]);

  return (
    <AuthScreenLayout
      taglineLines={AUTH_VERIFY_EMAIL_COPY.taglineLines}
      headlineLines={AUTH_VERIFY_EMAIL_COPY.headlineLines}
      headlineAccentLineIndex={AUTH_VERIFY_EMAIL_COPY.headlineAccentLineIndex}
      supportingCopy={
        tokenFromDeepLink
          ? 'Confirming your email address...'
          : AUTH_VERIFY_EMAIL_COPY.supportingCopy
      }
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>Need a new link?</AppText>
          <AuthLink label="Resend email" href="/(auth)/check-email" />
        </View>
      }
    >
      <View style={styles.form}>
        {!tokenFromDeepLink ? (
          <AuthInput
            placeholder="Verification token"
            leadingIcon="email"
            value={manualToken}
            onChangeText={setManualToken}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="oneTimeCode"
            returnKeyType="done"
            onSubmitEditing={() => void handleSubmit()}
          />
        ) : null}

        {successMessage ? <AuthFormMessage message={successMessage} tone="success" /> : null}
        {formError ? <AuthFormMessage message={formError} tone="error" /> : null}

        {!tokenFromDeepLink ? (
          <AuthPrimaryButton
            title="Verify email"
            onPress={() => void handleSubmit()}
            loading={isSubmitting}
          />
        ) : isSubmitting ? (
          <AuthPrimaryButton title="Verifying..." loading />
        ) : null}

        <View style={styles.secondaryLink}>
          <AuthLink label="Back to sign in" href="/(auth)/login" accent={false} />
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
