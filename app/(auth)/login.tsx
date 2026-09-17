import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { useAuth } from '@/auth/useAuth';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  hasValidationErrors,
  validateLoginForm,
  type LoginFormErrors,
} from '@/utils/validation';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { SocialAuthSection } from '@/features/auth/components/SocialAuthSection';
import { beginHomeColdStartTrace } from '@/perf/home-cold-start-trace';
import { colors } from '@/theme/colors';
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
      eyebrow="Now showing"
      title="MovieApp"
      subtitle="Your seat is waiting. Sign in to pick up where you left off."
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" muted>New here?</AppText>
          <AuthLink label="Create an account" href="/(auth)/register" />
        </View>
      }
    >
      <SocialAuthSection onError={setFormError} />

      <AuthDivider label="or with email" />

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
          returnKeyType="next"
        />
        <AppInput
          label="Password"
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
          <AuthLink label="Forgot password?" href="/(auth)/forgot-password" accent={false} />
        </View>

        {formError ? (
          <AppText variant="bodySmall" style={styles.formError} accessibilityRole="alert">
            {formError}
          </AppText>
        ) : null}

        <AppButton title="Sign in" onPress={() => void handleLogin()} loading={isSubmitting} />
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
  formError: {
    color: colors.error,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
