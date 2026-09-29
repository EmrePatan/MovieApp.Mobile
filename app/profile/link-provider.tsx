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
import { useLinkExternalLoginMutation } from '@/features/profile/hooks/useProfileMutations';
import type { SocialAuthProvider } from '@/models/api/auth';
import { spacing } from '@/theme/spacing';

export default function LinkProviderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    targetProvider: SocialAuthProvider;
    targetIdentityToken: string;
  }>();
  const linkProvider = useLinkExternalLoginMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!params.targetProvider || !params.targetIdentityToken) {
      return;
    }

    linkProvider.mutate(
      {
        targetProvider: params.targetProvider,
        targetIdentityToken: params.targetIdentityToken,
        currentPassword,
      },
      {
        onSuccess: () => router.replace('/profile/security'),
        onError: (error) => {
          setFeedback(
            isApiError(error)
              ? getDisplayMessageForApiError(error, 'profile')
              : t('profile.linkProviderFailed'),
          );
        },
      },
    );
  };

  return (
    <Screen scrollable>
      <DetailBackButton />
      <AppText variant="title">{t('profile.linkProviderTitle')}</AppText>
      <AppText variant="bodySmall" muted>{t('profile.linkProviderPasswordHint')}</AppText>
      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
      <View style={styles.form}>
        <PasswordInput
          label={t('profile.currentPassword')}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <AppButton
          title={t('profile.confirmLinkProvider')}
          loading={linkProvider.isPending}
          onPress={handleSubmit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md, marginTop: spacing.md },
});
