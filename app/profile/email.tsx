import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  getDisplayMessageForApiError,
  isApiError,
} from '@/api/errors';
import {
  requestSocialIdentityToken,
  SocialAuthCancelledError,
} from '@/auth/social-auth-service';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { AppInput } from '@/components/inputs/AppInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useChangeEmailMutation } from '@/features/profile/hooks/useProfileMutations';
import {
  hasProfileValidationErrors,
  validateChangeEmail,
  type ChangeEmailFormErrors,
} from '@/features/profile/utils/profile-validation';
import type { ChangeEmailRequest } from '@/features/profile/types';
import { spacing } from '@/theme/spacing';

export default function ChangeEmailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profileQuery = useCurrentProfile();
  const changeEmail = useChangeEmailMutation();
  const profile = profileQuery.data;
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ChangeEmailFormErrors>({});
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const errors = validateChangeEmail(
      email,
      profile?.hasPassword ? currentPassword : 'social-reauth',
    );
    if (!profile?.hasPassword) {
      delete errors.currentPassword;
    }
    setFieldErrors(errors);

    if (hasProfileValidationErrors(errors) || !profile) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      let payload: ChangeEmailRequest = {
        email: email.trim(),
        currentPassword: profile.hasPassword ? currentPassword : undefined,
      };

      if (!profile.hasPassword) {
        const reauthProvider = profile.linkedProviders[0];
        if (!reauthProvider) {
          setFeedback({ message: t('profile.emailChangeReauthRequired'), tone: 'error' });
          return;
        }
        const identityToken = await requestSocialIdentityToken(reauthProvider);
        payload = {
          email: email.trim(),
          reauthProvider,
          reauthIdentityToken: identityToken,
        };
      }

      await changeEmail.mutateAsync(payload);
      setCurrentPassword('');
      router.push({
        pathname: '/(auth)/check-email',
        params: { email: email.trim() },
      });
    } catch (error) {
      if (error instanceof SocialAuthCancelledError) {
        return;
      }
      setFeedback({
        message: isApiError(error)
          ? error.kind === 'conflict'
            ? t('profile.emailInUse')
            : getDisplayMessageForApiError(error, 'profile')
          : t('profile.emailChangeFailed'),
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <DetailBackButton />
        <AppText variant="title">{t('profile.changeEmailTitle')}</AppText>
        <AppText variant="bodySmall" muted>
          {t('profile.currentEmail', { email: profile?.email ?? '—' })}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('profile.changeEmailVerificationHint')}
        </AppText>

        <FeedbackMessage
          message={feedback?.message ?? null}
          tone={feedback?.tone}
          onDismiss={() => setFeedback(null)}
        />

        <View style={styles.form}>
          <AppInput
            label={t('profile.newEmail')}
            value={email}
            onChangeText={setEmail}
            error={fieldErrors.email}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          {profile?.hasPassword ? (
            <PasswordInput
              label={t('profile.currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              error={fieldErrors.currentPassword}
              autoComplete="password"
              textContentType="password"
            />
          ) : (
            <AppText variant="bodySmall" muted>{t('profile.emailChangeSocialReauthHint')}</AppText>
          )}
          <AppButton
            title={t('profile.updateEmail')}
            loading={changeEmail.isPending || isSubmitting}
            disabled={changeEmail.isPending || isSubmitting}
            onPress={() => void handleSubmit()}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
