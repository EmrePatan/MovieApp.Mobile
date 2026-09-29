import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getDisplayMessageForApiError, isApiError } from '@/api/errors';
import { SocialAuthCancelledError } from '@/auth/social-auth-service';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { PasswordInput } from '@/components/inputs/PasswordInput';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { LinkedProviderReauthPicker } from '@/features/profile/components/LinkedProviderReauthPicker';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useLinkedProviderReauthChoice } from '@/features/profile/hooks/useLinkedProviderReauthChoice';
import { useCreatePasswordMutation } from '@/features/profile/hooks/useProfileMutations';
import { obtainLinkedProviderReauth } from '@/features/profile/utils/linked-provider-reauth';
import {
  hasProfileValidationErrors,
  validateCreatePasswordForm,
} from '@/features/profile/utils/profile-validation';
import { spacing } from '@/theme/spacing';

export default function CreatePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profileQuery = useCurrentProfile();
  const createPassword = useCreatePasswordMutation();
  const { pendingProviders, chooseProvider, selectProvider, cancelChoice } =
    useLinkedProviderReauthChoice();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profile = profileQuery.data;
  const linkedProviders = profile?.linkedProviders ?? [];

  const handleSubmit = async () => {
    if (!profile || linkedProviders.length === 0 || isSubmitting) {
      return;
    }

    const errors = validateCreatePasswordForm(newPassword, confirmPassword);
    if (hasProfileValidationErrors(errors)) {
      setFeedback(errors.newPassword ?? errors.confirmPassword ?? t('profile.createPasswordFailed'));
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const { provider, identityToken } = await obtainLinkedProviderReauth(
        linkedProviders,
        chooseProvider,
      );
      await createPassword.mutateAsync({
        newPassword,
        provider,
        identityToken,
      });
      router.replace('/profile/security');
    } catch (error) {
      if (error instanceof SocialAuthCancelledError) {
        return;
      }
      setFeedback(
        isApiError(error)
          ? getDisplayMessageForApiError(error, 'profile')
          : t('profile.createPasswordFailed'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable>
      <DetailBackButton />
      <AppText variant="title">{t('profile.createPasswordTitle')}</AppText>
      <AppText variant="bodySmall" muted>{t('profile.createPasswordHint')}</AppText>
      {pendingProviders ? (
        <LinkedProviderReauthPicker
          providers={pendingProviders}
          onSelect={selectProvider}
          onCancel={cancelChoice}
        />
      ) : null}
      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
      <View style={styles.form}>
        <PasswordInput
          label={t('auth.newPassword')}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <PasswordInput
          label={t('profile.confirmNewPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <AppButton
          title={t('profile.createPasswordAction')}
          loading={isSubmitting || createPassword.isPending}
          disabled={Boolean(pendingProviders)}
          onPress={() => void handleSubmit()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md, marginTop: spacing.md },
});
