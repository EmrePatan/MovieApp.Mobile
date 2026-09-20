import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import {
  EMAIL_NOT_VERIFIED_CODE,
  getUserMessageForAuthError,
  isApiError,
} from '@/api/errors';
import {
  hasValidationErrors,
  validateLoginForm,
  type LoginFormErrors,
} from '@/utils/validation';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { AuthFormMessage } from '@/features/auth/components/AuthFormMessage';
import { AuthInput } from '@/features/auth/components/AuthInput';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthPrimaryButton } from '@/features/auth/components/AuthPrimaryButton';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { SocialAuthSection } from '@/features/auth/components/SocialAuthSection';
import { beginHomeColdStartTrace } from '@/perf/home-cold-start-trace';
import { spacing } from '@/theme/spacing';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, resendVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  async function handleResendVerification() {
    if (!pendingVerificationEmail) {
      return;
    }

    setResendMessage(null);
    setIsResending(true);

    try {
      const message = await resendVerification(pendingVerificationEmail);
      setResendMessage(message);
    } catch (error) {
      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'resend-verification'));
      } else {
        setFormError(t('auth.unableToResendVerification'));
      }
    } finally {
      setIsResending(false);
    }
  }

  async function handleLogin() {
    const errors = validateLoginForm(email, password);
    setFieldErrors(errors);

    if (hasValidationErrors(errors)) {
      return;
    }

    setFormError(null);
    setResendMessage(null);
    setPendingVerificationEmail(null);
    setIsSubmitting(true);
    beginHomeColdStartTrace();

    try {
      await login(email.trim(), password);
    } catch (error) {
      if (isApiError(error) && error.kind === 'unauthorized' && error.responseBody) {
        const code = (error.responseBody as { code?: string }).code;
        if (code === EMAIL_NOT_VERIFIED_CODE) {
          setPendingVerificationEmail(email.trim());
          setFormError(t('auth.verifyBeforeSignIn'));
          return;
        }
      }

      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'login'));
      } else {
        setFormError(t('auth.unableToSignIn'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      taglineLines={[t('auth.loginTagline1'), t('auth.loginTagline2')]}
      headlineLines={[t('auth.loginHeadline1'), t('auth.loginHeadline2'), t('auth.loginHeadline3')]}
      headlineAccentLineIndex={2}
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>{t('auth.newHere')}</AppText>
          <AuthLink label={t('auth.createAnAccount')} href="/(auth)/register" />
        </View>
      }
    >
      <SocialAuthSection onError={setFormError} />

      <AuthDivider label={t('auth.loginDivider')} />

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
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <AuthInput
          ref={passwordRef}
          placeholder={t('auth.password')}
          leadingIcon="lock"
          showPasswordToggle
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={() => void handleLogin()}
        />

        <View style={styles.forgotRow}>
          <AuthLink label={t('auth.forgotPassword')} href="/(auth)/forgot-password" />
        </View>

        {formError ? <AuthFormMessage message={formError} tone="error" /> : null}
        {resendMessage ? <AuthFormMessage message={resendMessage} tone="success" /> : null}

        {pendingVerificationEmail ? (
          <AuthPrimaryButton
            title={t('auth.resendVerificationEmail')}
            onPress={() => void handleResendVerification()}
            loading={isResending}
          />
        ) : null}

        <AuthPrimaryButton
          title={t('auth.signIn')}
          onPress={() => void handleLogin()}
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
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -spacing.xs,
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
