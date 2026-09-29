import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getDisplayMessageForApiError, isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { PasswordInput } from '@/components/inputs/PasswordInput';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { useUnlinkExternalLoginMutation } from '@/features/profile/hooks/useProfileMutations';
import type { SocialAuthProvider } from '@/models/api/auth';
import { spacing } from '@/theme/spacing';

export default function UnlinkProviderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ provider: SocialAuthProvider }>();
  const unlinkProvider = useUnlinkExternalLoginMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!params.provider) {
      return;
    }

    unlinkProvider.mutate(
      { provider: params.provider, currentPassword },
      {
        onSuccess: () => router.replace('/profile/security'),
        onError: (error) => {
          setFeedback(
            isApiError(error)
              ? getDisplayMessageForApiError(error, 'profile')
              : t('profile.unlinkProviderFailed'),
          );
        },
      },
    );
  };

  return (
    <Screen scrollable>
      <DetailBackButton />
      <AppText variant="title">{t('profile.unlinkProviderTitle')}</AppText>
      <AppText variant="bodySmall" muted>{t('profile.unlinkProviderPasswordHint')}</AppText>
      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
      <View style={styles.form}>
        <PasswordInput
          label={t('profile.currentPassword')}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <AppButton
          title={t('profile.confirmUnlinkProvider')}
          loading={unlinkProvider.isPending}
          onPress={handleSubmit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md, marginTop: spacing.md },
});
