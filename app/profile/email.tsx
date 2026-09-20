import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
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
import { spacing } from '@/theme/spacing';

export default function ChangeEmailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profileQuery = useCurrentProfile();
  const changeEmail = useChangeEmailMutation();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ChangeEmailFormErrors>({});
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );

  const handleSubmit = () => {
    const errors = validateChangeEmail(email, currentPassword);
    setFieldErrors(errors);

    if (hasProfileValidationErrors(errors)) {
      return;
    }

    changeEmail.mutate(
      { email: email.trim(), currentPassword },
      {
        onSuccess: (_, variables) => {
          setCurrentPassword('');
          router.push({
            pathname: '/(auth)/check-email',
            params: { email: variables.email.trim() },
          });
        },
        onError: (error) => {
          setFeedback({
            message: isApiError(error)
              ? error.kind === 'conflict'
                ? t('profile.emailInUse')
                : error.userMessage
              : t('profile.emailChangeFailed'),
            tone: 'error',
          });
        },
      },
    );
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
          {t('profile.currentEmail', { email: profileQuery.data?.email ?? '—' })}
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
          <PasswordInput
            label={t('profile.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            error={fieldErrors.currentPassword}
            autoComplete="password"
            textContentType="password"
          />
          <AppButton
            title={t('profile.updateEmail')}
            loading={changeEmail.isPending}
            disabled={changeEmail.isPending}
            onPress={handleSubmit}
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
