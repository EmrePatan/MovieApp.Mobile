import { useCallback, useState, type ReactNode } from 'react';

import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useTranslation } from 'react-i18next';

import { Ionicons } from '@expo/vector-icons';

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

import { borderRadius, spacing } from '@/theme/spacing';



const PROVIDERS: SocialAuthProvider[] = ['google', 'apple'];
const PROVIDER_ICON_SIZE = 24;



export default function SignInSecurityScreen() {

  const router = useRouter();

  const { t } = useTranslation();

  const profileQuery = useCurrentProfile();

  const linkProvider = useLinkExternalLoginMutation();

  const unlinkProvider = useUnlinkExternalLoginMutation();

  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );

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

          setFeedback({ message: t('profile.linkProviderReauthRequired'), tone: 'error' });

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

        setFeedback({ message: t('profile.providerLinked'), tone: 'success' });

      } catch (error) {

        if (error instanceof SocialAuthCancelledError) {

          return;

        }

        if (error instanceof SocialAuthConfigurationError) {

          setFeedback({ message: error.message, tone: 'error' });

          return;

        }

        setFeedback({

          message: isApiError(error)

            ? getDisplayMessageForApiError(error, 'profile')

            : t('profile.linkProviderFailed'),

          tone: 'error',

        });

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

        setFeedback({ message: t('profile.cannotRemoveLastSignInMethod'), tone: 'error' });

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

          setFeedback({ message: t('profile.linkProviderReauthRequired'), tone: 'error' });

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

        setFeedback({

          message: isApiError(error)

            ? getDisplayMessageForApiError(error, 'profile')

            : t('profile.unlinkProviderFailed'),

          tone: 'error',

        });

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

  const pendingEmail = profile.pendingEmail?.trim() || null;



  const emailAccessibilityLabel = pendingEmail

    ? `${t('profile.email')}, ${profile.email}, ${t('profile.emailVerificationPendingFor', { email: pendingEmail })}`

    : `${t('profile.email')}, ${profile.email}`;



  const passwordAccessibilityLabel = profile.hasPassword

    ? `${t('profile.password')}, ${t('profile.passwordStatusSet')}`

    : `${t('profile.password')}, ${t('profile.passwordNotSet')}`;



  return (

    <Screen scrollable style={styles.screenContent}>

      <DetailBackButton />

      <View style={styles.header}>

        <AppText variant="title">{t('profile.signInSecurityTitle')}</AppText>

        <AppText variant="bodySmall" muted>{t('profile.signInSecuritySubtitle')}</AppText>

      </View>



      <FeedbackMessage

        message={feedback?.message ?? null}

        tone={feedback?.tone}

        onDismiss={() => setFeedback(null)}

      />



      {pendingProviders ? (

        <LinkedProviderReauthPicker

          providers={pendingProviders}

          onSelect={selectProvider}

          onCancel={cancelChoice}

        />

      ) : null}



      <View style={styles.section}>

        <AppText variant="caption" muted style={styles.sectionLabel}>

          {t('profile.account')}

        </AppText>

        <View style={styles.groupCard}>

          <AccountNavRow

            accessibilityLabel={emailAccessibilityLabel}

            icon="mail"

            title={t('profile.email')}

            onPress={() =>

              router.push(pendingEmail ? '/profile/email-pending' : '/profile/email')

            }

          >

            <AppText variant="caption" muted numberOfLines={1}>

              {profile.email}

            </AppText>

            {pendingEmail ? (

              <AppText variant="caption" style={styles.pendingHint} numberOfLines={2}>

                {t('profile.emailVerificationPendingFor', { email: pendingEmail })}

              </AppText>

            ) : null}

          </AccountNavRow>

          <GroupDivider />

          <AccountNavRow

            accessibilityLabel={passwordAccessibilityLabel}

            icon="lock-closed"

            title={t('profile.password')}

            onPress={() =>

              router.push(profile.hasPassword ? '/profile/password' : '/profile/create-password')

            }

          >

            <AppText variant="caption" muted>

              {profile.hasPassword

                ? t('profile.passwordStatusSet')

                : t('profile.passwordNotSet')}

            </AppText>

          </AccountNavRow>

        </View>

      </View>



      <View style={styles.section}>

        <AppText variant="caption" muted style={styles.sectionLabel}>

          {t('profile.signInMethods')}

        </AppText>

        <View style={styles.groupCard}>

          {PROVIDERS.map((provider, index) => {

            const linked = isProviderLinked(profile, provider);

            const providerName =

              provider === 'google' ? t('profile.providerGoogle') : t('profile.providerApple');

            const statusLabel = linked

              ? t('profile.providerConnected')

              : t('profile.providerNotConnected');

            const busy = activeProvider === provider;

            const showConnect = !linked && connectable.includes(provider);

            const showDisconnect = linked && canUnlinkProvider(profile, provider);

            const statusAccessibility = `${providerName}, ${statusLabel}`;



            return (

              <View key={provider}>

                {index > 0 ? <GroupDivider /> : null}

                <View style={styles.providerRow} accessibilityLabel={statusAccessibility}>

                  <View style={styles.providerRowIconSlot}>

                    <SocialAuthProviderIcon provider={provider} size={PROVIDER_ICON_SIZE} />

                  </View>

                  <View style={styles.providerText}>

                    <AppText variant="body">{providerName}</AppText>

                    <AppText variant="caption" muted>{statusLabel}</AppText>

                  </View>

                  {busy ? (

                    <ActivityIndicator color={colors.textPrimary} />

                  ) : showDisconnect ? (

                    <Pressable

                      accessibilityRole="button"

                      accessibilityLabel={`${t('profile.disconnectProvider')} ${providerName}`}

                      hitSlop={8}

                      onPress={() => void handleUnlink(provider)}

                      style={({ pressed }) => [styles.rowAction, pressed && styles.rowActionPressed]}

                    >

                      <AppText variant="bodySmall" style={styles.unlinkAction}>

                        {t('profile.disconnectProvider')}

                      </AppText>

                    </Pressable>

                  ) : showConnect ? (

                    <Pressable

                      accessibilityRole="button"

                      accessibilityLabel={`${t('profile.connectProvider')} ${providerName}`}

                      hitSlop={8}

                      onPress={() => void handleConnect(provider)}

                      style={({ pressed }) => [styles.rowAction, pressed && styles.rowActionPressed]}

                    >

                      <AppText variant="bodySmall" style={styles.connectAction}>

                        {t('profile.connectProvider')}

                      </AppText>

                    </Pressable>

                  ) : null}

                </View>

              </View>

            );

          })}

        </View>

      </View>

    </Screen>

  );

}



interface AccountNavRowProps {

  accessibilityLabel: string;

  icon: keyof typeof Ionicons.glyphMap;

  title: string;

  onPress: () => void;

  children: ReactNode;

}



function AccountNavRow({

  accessibilityLabel,

  icon,

  title,

  onPress,

  children,

}: AccountNavRowProps) {

  return (

    <Pressable

      accessibilityRole="button"

      accessibilityLabel={accessibilityLabel}

      onPress={onPress}

      style={({ pressed }) => [styles.accountRow, pressed && styles.rowPressed]}

    >

      <View style={styles.rowIconSlot}>

        <Ionicons name={icon} size={20} color={colors.textSecondary} />

      </View>

      <View style={styles.accountRowText}>

        <AppText variant="body">{title}</AppText>

        {children}

      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />

    </Pressable>

  );

}



function GroupDivider() {

  return <View style={styles.divider} />;

}



const styles = StyleSheet.create({

  screenContent: {

    gap: spacing.md,

    paddingBottom: spacing.lg,

  },

  header: {

    gap: spacing.xs,

  },

  section: {

    gap: spacing.xs,

  },

  sectionLabel: {

    letterSpacing: 0.8,

    textTransform: 'uppercase',

    marginLeft: spacing.xs,

  },

  groupCard: {

    backgroundColor: colors.surface,

    borderRadius: borderRadius.lg,

    borderWidth: 1,

    borderColor: colors.border,

    overflow: 'hidden',

  },

  accountRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

    paddingHorizontal: spacing.md,

    paddingVertical: spacing.sm + 2,

    minHeight: 64,

  },

  rowPressed: {

    opacity: 0.88,

  },

  rowIconSlot: {

    width: 22,

    height: 22,

    alignItems: 'center',

    justifyContent: 'center',

  },

  providerRowIconSlot: {

    width: PROVIDER_ICON_SIZE,

    height: PROVIDER_ICON_SIZE,

    alignItems: 'center',

    justifyContent: 'center',

  },

  accountRowText: {

    flex: 1,

    gap: 2,

    paddingRight: spacing.xs,

  },

  pendingHint: {

    color: colors.accentMuted,

  },

  divider: {

    height: StyleSheet.hairlineWidth,

    backgroundColor: colors.border,

    marginLeft: spacing.md + 22 + spacing.sm,

  },

  providerRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

    paddingHorizontal: spacing.md,

    paddingVertical: spacing.sm + 2,

    minHeight: 64,

  },

  providerText: {

    flex: 1,

    gap: 2,

  },

  rowAction: {

    minHeight: 44,

    justifyContent: 'center',

    paddingHorizontal: spacing.xs,

  },

  rowActionPressed: {

    opacity: 0.85,

  },

  connectAction: {

    color: colors.accent,

  },

  unlinkAction: {

    color: colors.error,

  },

});


