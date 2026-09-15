import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { useAuth } from '@/auth/useAuth';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  hasValidationErrors,
  validateRegisterForm,
  type RegisterFormErrors,
} from '@/utils/validation';
import { SocialAuthSection } from '@/features/auth/components/SocialAuthSection';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

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
    <Screen scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <AppText variant="title">Create account</AppText>
          <AppText variant="body" muted center>
            Join MovieApp to save favorites, watchlists, and more
          </AppText>
        </View>

        <View style={styles.form}>
          <AppInput
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            error={fieldErrors.displayName}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
          />
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

          <Link href="/(auth)/login" asChild>
            <AppButton title="Back to sign in" variant="secondary" />
          </Link>

          <SocialAuthSection onError={setFormError} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  formError: {
    color: colors.error,
  },
});
