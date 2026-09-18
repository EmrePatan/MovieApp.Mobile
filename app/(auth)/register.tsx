import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAuth } from '@/auth/useAuth';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  hasValidationErrors,
  validateRegisterForm,
  type RegisterFormErrors,
} from '@/utils/validation';
import { AUTH_REGISTER_COPY } from '@/features/auth/auth-copy';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { AuthInput } from '@/features/auth/components/AuthInput';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { SocialAuthSection } from '@/features/auth/components/SocialAuthSection';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    const errors = validateRegisterForm(email, password, displayName);
    setFieldErrors(errors);

    if (hasValidationErrors(errors)) {
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await register(email.trim(), password, displayName.trim());
    } catch (error) {
      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'register'));
      } else {
        setFormError('Unable to create your account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      tagline={AUTH_REGISTER_COPY.tagline}
      headlineLines={AUTH_REGISTER_COPY.headlineLines}
      headlineAccentLineIndex={AUTH_REGISTER_COPY.headlineAccentLineIndex}
      supportingCopy={AUTH_REGISTER_COPY.supportingCopy}
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>Already have an account?</AppText>
          <AuthLink label="Sign in" href="/(auth)/login" />
        </View>
      }
    >
      <SocialAuthSection onError={setFormError} />

      <AuthDivider label={AUTH_REGISTER_COPY.emailDivider} />

      <View style={styles.form}>
        <AuthInput
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          error={fieldErrors.displayName}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />
        <AuthInput
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
        <AuthInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => void handleRegister()}
        />

        {formError ? (
          <AppText variant="bodySmall" style={styles.formError} accessibilityRole="alert">
            {formError}
          </AppText>
        ) : null}

        <AppButton
          title="Create account"
          onPress={() => void handleRegister()}
          loading={isSubmitting}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.sm,
  },
  formError: {
    color: colors.error,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    color: 'rgba(245, 245, 247, 0.72)',
  },
});
