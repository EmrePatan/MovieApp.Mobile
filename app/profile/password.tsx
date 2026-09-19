import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { PasswordInput } from '@/components/inputs/PasswordInput';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { useChangePasswordMutation } from '@/features/profile/hooks/useProfileMutations';
import {
  hasProfileValidationErrors,
  validateChangePassword,
  type ChangePasswordFormErrors,
} from '@/features/profile/utils/profile-validation';
import { spacing } from '@/theme/spacing';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const changePassword = useChangePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFormErrors>({});
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );

  const handleSubmit = () => {
    const errors = validateChangePassword(currentPassword, newPassword, confirmPassword);
    setFieldErrors(errors);

    if (hasProfileValidationErrors(errors)) {
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setFeedback({ message: t('profile.passwordUpdated'), tone: 'success' });
          setTimeout(() => router.back(), 800);
        },
        onError: (error) => {
          setFeedback({
            message: isApiError(error)
              ? error.userMessage
              : t('profile.passwordChangeFailed'),
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
        <AppText variant="title">{t('profile.changePasswordTitle')}</AppText>
        <AppText variant="bodySmall" muted>
          {t('profile.changePasswordHint')}
        </AppText>

        <FeedbackMessage
          message={feedback?.message ?? null}
          tone={feedback?.tone}
          onDismiss={() => setFeedback(null)}
        />

        <View style={styles.form}>
          <PasswordInput
            label={t('profile.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            error={fieldErrors.currentPassword}
            autoComplete="password"
            textContentType="password"
          />
          <PasswordInput
            label={t('auth.newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            error={fieldErrors.newPassword}
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <PasswordInput
            label={t('profile.confirmNewPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <AppButton
            title={t('profile.updatePassword')}
            loading={changePassword.isPending}
            disabled={changePassword.isPending}
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
