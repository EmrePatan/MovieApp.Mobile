import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  hasValidationErrors,
  validateLoginForm,
  type LoginFormErrors,
} from '@/utils/validation';
import { AUTH_LOGIN_COPY } from '@/features/auth/auth-copy';
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
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    const errors = validateLoginForm(email, password);
    setFieldErrors(errors);

    if (hasValidationErrors(errors)) {
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    beginHomeColdStartTrace();

    try {
      await login(email.trim(), password);
    } catch (error) {
      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'login'));
      } else {
        setFormError('Unable to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      taglineLines={AUTH_LOGIN_COPY.taglineLines}
      headlineLines={AUTH_LOGIN_COPY.headlineLines}
      headlineAccentLineIndex={AUTH_LOGIN_COPY.headlineAccentLineIndex}
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>New here?</AppText>
          <AuthLink label="Create an account" href="/(auth)/register" />
        </View>
      }
    >
      <SocialAuthSection onError={setFormError} />

      <AuthDivider label={AUTH_LOGIN_COPY.emailDivider} />

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
          returnKeyType="next"
        />
        <AuthInput
          placeholder="Password"
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
          <AuthLink label="Forgot password?" href="/(auth)/forgot-password" />
        </View>

        {formError ? <AuthFormMessage message={formError} tone="error" /> : null}

        <AuthPrimaryButton
          title="Sign in"
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
