import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getDisplayMessageForApiError, isApiError } from '@/api/errors';
import {
  requestSocialIdentityToken,
  SocialAuthCancelledError,
  SocialAuthConfigurationError,
} from '@/auth/social-auth-service';
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
    targetProvider?: SocialAuthProvider;
  }>();
  const targetProvider = params.targetProvider;
  const linkProvider = useLinkExternalLoginMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!targetProvider || isSubmitting || linkProvider.isPending) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const targetIdentityToken = await requestSocialIdentityToken(targetProvider);
      await linkProvider.mutateAsync({
        targetProvider,
        targetIdentityToken,
        currentPassword,
      });
      router.replace('/profile/security');
    } catch (error) {
      if (error instanceof SocialAuthCancelledError) {
        return;
      }
      if (error instanceof SocialAuthConfigurationError) {
        setFeedback(error.message);
        return;
      }
      setFeedback(
        isApiError(error)
          ? getDisplayMessageForApiError(error, 'profile')
          : t('profile.linkProviderFailed'),
      );
    } finally {
      setIsSubmitting(false);
    }
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
          loading={isSubmitting || linkProvider.isPending}
          disabled={!targetProvider || isSubmitting || linkProvider.isPending}
          onPress={() => void handleSubmit()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md, marginTop: spacing.md },
});
