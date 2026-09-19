import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { PasswordInput } from '@/components/inputs/PasswordInput';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { useDeleteAccountMutation } from '@/features/profile/hooks/useProfileMutations';
import {
  hasProfileValidationErrors,
  validateDeleteAccount,
  type DeleteAccountFormErrors,
} from '@/features/profile/utils/profile-validation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const deleteAccount = useDeleteAccountMutation();
  const [step, setStep] = useState<'confirm' | 'password'>('confirm');
  const [currentPassword, setCurrentPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<DeleteAccountFormErrors>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleContinue = () => {
    setStep('password');
  };

  const handleDelete = () => {
    const errors = validateDeleteAccount(currentPassword);
    setFieldErrors(errors);

    if (hasProfileValidationErrors(errors)) {
      return;
    }

    deleteAccount.mutate(
      { currentPassword },
      {
        onError: (error) => {
          setFeedback(
            isApiError(error)
              ? error.userMessage
              : t('profile.deleteAccountFailed'),
          );
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
        <AppText variant="title">{t('profile.deleteAccountTitle')}</AppText>

        <FeedbackMessage
          message={feedback}
          tone="error"
          onDismiss={() => setFeedback(null)}
        />

        {step === 'confirm' ? (
          <View style={styles.content}>
            <AppText variant="body">{t('profile.deleteAccountWarning')}</AppText>
            <AppText variant="bodySmall" muted>
              {t('profile.deleteAccountIrreversible')}
            </AppText>
            <AppButton title={t('common.continue')} variant="secondary" onPress={handleContinue} />
          </View>
        ) : (
          <View style={styles.content}>
            <AppText variant="bodySmall" muted>
              {t('profile.deleteAccountPasswordHint')}
            </AppText>
            <PasswordInput
              label={t('profile.currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              error={fieldErrors.currentPassword}
              autoComplete="password"
              textContentType="password"
            />
            <AppButton
              title={t('profile.deleteMyAccount')}
              loading={deleteAccount.isPending}
              disabled={deleteAccount.isPending}
              onPress={handleDelete}
              style={styles.deleteButton}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  content: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
});
