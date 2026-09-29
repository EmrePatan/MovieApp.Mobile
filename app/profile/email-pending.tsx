import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getDisplayMessageForApiError, isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useResendPendingEmailChangeMutation } from '@/features/profile/hooks/useProfileMutations';
import { spacing } from '@/theme/spacing';

export default function EmailPendingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profileQuery = useCurrentProfile();
  const resend = useResendPendingEmailChangeMutation();
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );

  const profile = profileQuery.data;
  const pendingEmail = profile?.pendingEmail?.trim();

  useEffect(() => {
    if (profileQuery.isSuccess && !pendingEmail) {
      router.replace('/profile/security');
    }
  }, [pendingEmail, profileQuery.isSuccess, router]);

  if (!pendingEmail) {
    return (
      <Screen>
        <AppText variant="bodySmall" muted>{t('common.loading')}</AppText>
      </Screen>
    );
  }

  const handleResend = () => {
    setFeedback(null);
    resend.mutate(undefined, {
      onSuccess: () => {
        setFeedback({ message: t('profile.emailVerificationResent'), tone: 'success' });
        void profileQuery.refetch();
      },
      onError: (error) => {
        setFeedback({
          message: isApiError(error)
            ? getDisplayMessageForApiError(error, 'profile')
            : t('profile.emailChangeFailed'),
          tone: 'error',
        });
      },
    });
  };

  return (
    <Screen scrollable>
      <DetailBackButton />
      <AppText variant="title">{t('profile.emailPendingTitle')}</AppText>
      <AppText variant="bodySmall" muted>
        {t('profile.emailPendingDescription', { email: pendingEmail })}
      </AppText>
      <AppText variant="bodySmall" muted>
        {t('profile.emailPendingCurrentEmailNote', { email: profile?.email ?? '—' })}
      </AppText>

      <FeedbackMessage
        message={feedback?.message ?? null}
        tone={feedback?.tone}
        onDismiss={() => setFeedback(null)}
      />

      <View style={styles.actions}>
        <AppButton
          title={t('profile.resendEmailVerification')}
          loading={resend.isPending}
          onPress={handleResend}
        />
        <AppButton
          title={t('profile.changeEmailAddress')}
          variant="secondary"
          onPress={() => router.push('/profile/email')}
        />
        <AppButton
          title={t('profile.backToSignInSecurity')}
          variant="secondary"
          onPress={() => router.replace('/profile/security')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.md, marginTop: spacing.md },
});
