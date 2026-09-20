import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
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
import { SocialAuthProviderIcon } from '@/features/auth/components/SocialAuthProviderIcon';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useDeleteAccountMutation } from '@/features/profile/hooks/useProfileMutations';
import {
  getDeleteAccountConfirmationMethod,
  getDeleteAccountSocialProviders,
} from '@/features/profile/utils/delete-account-confirmation';
import {
  hasProfileValidationErrors,
  validateDeleteAccount,
  type DeleteAccountFormErrors,
} from '@/features/profile/utils/profile-validation';
import type { SocialAuthProvider } from '@/models/api/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const profileQuery = useCurrentProfile();
  const deleteAccount = useDeleteAccountMutation();
  const [step, setStep] = useState<'confirm' | 'verify'>('confirm');
  const [currentPassword, setCurrentPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<DeleteAccountFormErrors>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<SocialAuthProvider | null>(null);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);

  const profile = profileQuery.data;
  const isDeleting = isDeleteInProgress || deleteAccount.isPending;
  const confirmationMethod = profile ? getDeleteAccountConfirmationMethod(profile) : null;
  const socialProviders = profile ? getDeleteAccountSocialProviders(profile) : [];

  const handleContinue = () => {
    setFeedback(null);
    setStep('verify');
  };

  const handleDeleteWithPassword = () => {
    if (isDeleting) {
      return;
    }

    const errors = validateDeleteAccount(currentPassword);
    setFieldErrors(errors);

    if (hasProfileValidationErrors(errors)) {
      return;
    }

    setIsDeleteInProgress(true);
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
        onSettled: () => {
          setIsDeleteInProgress(false);
        },
      },
    );
  };

  const handleDeleteWithSocial = useCallback(
    async (provider: SocialAuthProvider) => {
      if (isDeleting) {
        return;
      }

      setFeedback(null);
      setIsDeleteInProgress(true);
      setActiveProvider(provider);

      try {
        const identityToken = await requestSocialIdentityToken(provider);
        await deleteAccount.mutateAsync({ provider, identityToken });
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
            ? error.userMessage
            : t('profile.deleteAccountFailed'),
        );
      } finally {
        setActiveProvider(null);
        setIsDeleteInProgress(false);
      }
    },
    [deleteAccount, isDeleting, t],
  );

  const getSocialProviderLabel = (provider: SocialAuthProvider) =>
    provider === 'google' ? t('profile.deleteAccountWithGoogle') : t('profile.deleteAccountWithApple');

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
            <AppButton
              title={t('common.continue')}
              variant="secondary"
              onPress={handleContinue}
              disabled={!profile}
            />
          </View>
        ) : confirmationMethod === 'password' ? (
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
              loading={isDeleting}
              disabled={isDeleting}
              onPress={handleDeleteWithPassword}
              style={styles.deleteButton}
            />
          </View>
        ) : (
          <View style={styles.content}>
            <AppText variant="bodySmall" muted>
              {t('profile.deleteAccountSocialHint')}
            </AppText>
            {socialProviders.map((provider) => {
              const isLoading = activeProvider === provider;
              const isDisabled = isDeleting && activeProvider !== provider;

              return (
                <Pressable
                  key={provider}
                  accessibilityRole="button"
                  accessibilityLabel={getSocialProviderLabel(provider)}
                  accessibilityState={{ disabled: isDisabled, busy: isLoading }}
                  disabled={isDisabled || isDeleting}
                  onPress={() => void handleDeleteWithSocial(provider)}
                  style={({ pressed }) => [
                    styles.providerButton,
                    pressed && !isDisabled && styles.providerButtonPressed,
                    isDisabled && styles.providerButtonDisabled,
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.textPrimary} />
                  ) : (
                    <View style={styles.providerContent}>
                      <SocialAuthProviderIcon provider={provider} size={22} />
                      <AppText variant="body" style={styles.providerLabel}>
                        {getSocialProviderLabel(provider)}
                      </AppText>
                      <View style={styles.providerIconSpacer} />
                    </View>
                  )}
                </Pressable>
              );
            })}
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
  providerButton: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(12, 12, 18, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  providerButtonPressed: {
    opacity: interaction.pressedOpacity,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: 'rgba(18, 18, 26, 0.52)',
  },
  providerButtonDisabled: {
    opacity: interaction.disabledOpacity,
  },
  providerContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 16,
  },
  providerIconSpacer: {
    width: 22,
  },
});
