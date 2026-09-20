import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  hasValidationErrors,
  validateRegisterForm,
  type RegisterFormErrors,
} from '@/utils/validation';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { AuthFormMessage } from '@/features/auth/components/AuthFormMessage';
import { AuthInput } from '@/features/auth/components/AuthInput';
import { AuthLink } from '@/features/auth/components/AuthLink';
import { AuthPrimaryButton } from '@/features/auth/components/AuthPrimaryButton';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { SocialAuthSection } from '@/features/auth/components/SocialAuthSection';
import { spacing } from '@/theme/spacing';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleRegister() {
    const errors = validateRegisterForm(email, password, displayName);
    setFieldErrors(errors);

    if (hasValidationErrors(errors)) {
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await register(email.trim(), password, displayName.trim());
      router.push({
        pathname: '/(auth)/check-email',
        params: { email: result.email },
      });
    } catch (error) {
      if (isApiError(error)) {
        setFormError(getUserMessageForAuthError(error.kind, 'register'));
      } else {
        setFormError(t('auth.unableToCreateAccount'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      taglineLines={[t('auth.registerTagline1'), t('auth.registerTagline2')]}
      headlineLines={[t('auth.registerHeadline1'), t('auth.registerHeadline2'), t('auth.registerHeadline3')]}
      headlineAccentLineIndex={1}
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" style={styles.footerText}>{t('auth.alreadyHaveAccount')}</AppText>
          <AuthLink label={t('auth.signIn')} href="/(auth)/login" />
        </View>
      }
    >
      <SocialAuthSection onError={setFormError} />

      <AuthDivider label={t('auth.registerDivider')} />

      <View style={styles.form}>
        <AuthInput
          placeholder={t('auth.displayName')}
          leadingIcon="person"
          value={displayName}
          onChangeText={setDisplayName}
          error={fieldErrors.displayName}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <AuthInput
          ref={emailRef}
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
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => void handleRegister()}
        />

        {formError ? <AuthFormMessage message={formError} tone="error" /> : null}

        <AuthPrimaryButton
          title={t('auth.createAccount')}
          onPress={() => void handleRegister()}
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
