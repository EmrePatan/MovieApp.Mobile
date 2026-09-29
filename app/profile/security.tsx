import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getDisplayMessageForApiError, isApiError } from '@/api/errors';
import {
  requestSocialIdentityToken,
  SocialAuthCancelledError,
  SocialAuthConfigurationError,
} from '@/auth/social-auth-service';
import { SocialAuthProviderIcon } from '@/features/auth/components/SocialAuthProviderIcon';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { ProfileMenuRow, ProfileSection } from '@/features/profile/components/ProfileSection';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import {
  useLinkExternalLoginMutation,
  useUnlinkExternalLoginMutation,
} from '@/features/profile/hooks/useProfileMutations';
import { useLinkedProviderReauthChoice } from '@/features/profile/hooks/useLinkedProviderReauthChoice';
import { LinkedProviderReauthPicker } from '@/features/profile/components/LinkedProviderReauthPicker';
import { obtainLinkedProviderReauth } from '@/features/profile/utils/linked-provider-reauth';
import {
  canUnlinkProvider,
  getConnectableProviders,
  getUnlinkReauthProvider,
  isProviderLinked,
} from '@/features/profile/utils/sign-in-methods';
import type { SocialAuthProvider } from '@/models/api/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SignInSecurityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profileQuery = useCurrentProfile();
  const linkProvider = useLinkExternalLoginMutation();
  const unlinkProvider = useUnlinkExternalLoginMutation();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<SocialAuthProvider | null>(null);
  const { pendingProviders, chooseProvider, selectProvider, cancelChoice } =
    useLinkedProviderReauthChoice();

  const profile = profileQuery.data;

  const handleConnect = useCallback(
    async (targetProvider: SocialAuthProvider) => {
      if (!profile || activeProvider) {
        return;
      }

      setFeedback(null);
      setActiveProvider(targetProvider);

      try {
        if (profile.hasPassword) {
          router.push({
            pathname: '/profile/link-provider',
            params: { targetProvider },
          });
          return;
        }

        const targetToken = await requestSocialIdentityToken(targetProvider);
        const reauthCandidates = profile.linkedProviders;
        if (reauthCandidates.length === 0) {
          setFeedback(t('profile.linkProviderReauthRequired'));
          return;
        }

        const { provider: reauthProvider, identityToken: reauthToken } =
          await obtainLinkedProviderReauth(reauthCandidates, chooseProvider);

        await linkProvider.mutateAsync({
          targetProvider,
          targetIdentityToken: targetToken,
          reauthProvider,
          reauthIdentityToken: reauthToken,
        });
        setFeedback(t('profile.providerLinked'));
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
        setActiveProvider(null);
      }
    },
    [activeProvider, chooseProvider, linkProvider, profile, router, t],
  );

  const handleUnlink = useCallback(
    async (provider: SocialAuthProvider) => {
      if (!profile || activeProvider) {
        return;
      }

      if (!canUnlinkProvider(profile, provider)) {
        setFeedback(t('profile.cannotRemoveLastSignInMethod'));
        return;
      }

      setActiveProvider(provider);
      setFeedback(null);

      try {
        if (profile.hasPassword) {
          router.push({
            pathname: '/profile/unlink-provider',
            params: { provider },
          });
          return;
        }

        const reauthProvider = getUnlinkReauthProvider(profile, provider);
        if (!reauthProvider) {
          setFeedback(t('profile.linkProviderReauthRequired'));
          return;
        }

        const reauthToken = await requestSocialIdentityToken(reauthProvider);
        await unlinkProvider.mutateAsync({
          provider,
          reauthProvider,
          reauthIdentityToken: reauthToken,
        });
      } catch (error) {
        if (error instanceof SocialAuthCancelledError) {
          return;
        }
        setFeedback(
          isApiError(error)
            ? getDisplayMessageForApiError(error, 'profile')
            : t('profile.unlinkProviderFailed'),
        );
      } finally {
        setActiveProvider(null);
      }
    },
    [activeProvider, profile, router, unlinkProvider, t],
  );

  if (!profile) {
    return (
      <Screen>
        <AppText variant="bodySmall" muted>{t('profile.loadingProfile')}</AppText>
      </Screen>
    );
  }

  const connectable = getConnectableProviders(profile);

  return (
    <Screen scrollable>
      <DetailBackButton />
      <AppText variant="title">{t('profile.signInSecurityTitle')}</AppText>
      <AppText variant="bodySmall" muted>{t('profile.signInSecuritySubtitle')}</AppText>

      <FeedbackMessage
        message={typeof feedback === 'string' ? feedback : null}
        tone="error"
        onDismiss={() => setFeedback(null)}
      />

      {pendingProviders ? (
        <LinkedProviderReauthPicker
          providers={pendingProviders}
          onSelect={selectProvider}
          onCancel={cancelChoice}
        />
      ) : null}

      <ProfileSection title={t('profile.email')}>
        <ProfileMenuRow
          label={profile.email}
          subtitle={t('profile.changeEmail')}
          onPress={() => router.push('/profile/email')}
        />
      </ProfileSection>

      <ProfileSection title={t('profile.password')}>
        <ProfileMenuRow
          label={profile.hasPassword ? t('profile.passwordSet') : t('profile.passwordNotSet')}
          subtitle={
            profile.hasPassword ? t('profile.changePassword') : t('profile.createPassword')
          }
          onPress={() =>
            router.push(profile.hasPassword ? '/profile/password' : '/profile/create-password')
          }
        />
      </ProfileSection>

      <ProfileSection title={t('profile.connectedAccounts')}>
        {(['google', 'apple'] as SocialAuthProvider[]).map((provider) => {
          const linked = isProviderLinked(profile, provider);
          const label =
            provider === 'google' ? t('auth.continueWithGoogle') : t('auth.continueWithApple');
          const busy = activeProvider === provider;

          return (
            <View key={provider} style={styles.providerRow}>
              <SocialAuthProviderIcon provider={provider} size={22} />
              <View style={styles.providerText}>
                <AppText variant="body">{label}</AppText>
                <AppText variant="caption" muted>
                  {linked ? t('profile.providerConnected') : t('profile.providerNotConnected')}
                </AppText>
              </View>
              {busy ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : linked ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={!canUnlinkProvider(profile, provider)}
                  onPress={() => void handleUnlink(provider)}
                >
                  <AppText
                    variant="bodySmall"
                    style={
                      canUnlinkProvider(profile, provider)
                        ? styles.unlinkAction
                        : styles.unlinkDisabled
                    }
                  >
                    {t('profile.disconnectProvider')}
                  </AppText>
                </Pressable>
              ) : connectable.includes(provider) ? (
                <Pressable accessibilityRole="button" onPress={() => void handleConnect(provider)}>
                  <AppText variant="bodySmall" style={styles.connectAction}>
                    {t('profile.connectProvider')}
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ProfileSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  providerText: {
    flex: 1,
    gap: spacing.xs,
  },
  connectAction: {
    color: colors.accent,
  },
  unlinkAction: {
    color: colors.error,
  },
  unlinkDisabled: {
    color: colors.textMuted,
  },
});
