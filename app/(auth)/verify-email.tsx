import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { parseVerifyEmailTokenParam } from '@/auth/verify-email-utils';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import { AuthFormMessage } from '@/features/auth/components/AuthFormMessage';
import { AuthInput } from '@/features/auth/components/AuthInput';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthPrimaryButton } from '@/features/auth/components/AuthPrimaryButton';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { spacing } from '@/theme/spacing';

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
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
      setFormError(t('auth.verificationTokenRequired'));
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await verifyEmail(activeToken);
      setSuccessMessage(t('auth.emailVerifiedWelcome'));
    } catch (error) {
      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'verify-email'));
      } else {
        setFormError(t('auth.unableToVerifyEmail'));
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
        setSuccessMessage(t('auth.emailVerifiedWelcome'));
      } catch (error) {
        if (isApiError(error)) {
          setFormError(getUserMessageForAuthError(error.kind, 'verify-email'));
        } else {
          setFormError(t('auth.unableToVerifyEmail'));
        }
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [tokenFromDeepLink, hasAutoSubmitted, deepLinkToken, verifyEmail, t]);

  return (
    <AuthScreenLayout
      taglineLines={[t('auth.verifyEmailTagline1'), t('auth.verifyEmailTagline2')]}
      headlineLines={[t('auth.verifyEmailHeadline1'), t('auth.verifyEmailHeadline2')]}
      headlineAccentLineIndex={1}
      supportingCopy={
        tokenFromDeepLink ? t('auth.verifyEmailConfirming') : t('auth.verifyEmailSupporting')
      }
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>{t('auth.needNewLink')}</AppText>
          <AuthLink label={t('auth.resendEmail')} href="/(auth)/check-email" />
        </View>
      }
    >
      <View style={styles.form}>
        {!tokenFromDeepLink ? (
          <AuthInput
            placeholder={t('auth.verificationToken')}
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
            title={t('auth.verifyEmail')}
            onPress={() => void handleSubmit()}
            loading={isSubmitting}
          />
        ) : isSubmitting ? (
          <AuthPrimaryButton title={t('auth.verifying')} loading />
        ) : null}

        <View style={styles.secondaryLink}>
          <AuthLink label={t('common.backToSignIn')} href="/(auth)/login" accent={false} />
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
