import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { SocialAuthProviderIcon } from './SocialAuthProviderIcon';
import { useAuth } from '@/auth/useAuth';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  SocialAuthCancelledError,
  SocialAuthConfigurationError,
} from '@/auth/social-auth-service';
import {
  shouldShowAppleSocialAuthButton,
  shouldShowGoogleSocialAuthButton,
} from '@/auth/social-auth-ui';
import type { SocialAuthProvider } from '@/models/api/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface SocialAuthSectionProps {
  onError?: (message: string | null) => void;
}

interface SocialProviderConfig {
  provider: SocialAuthProvider;
  labelKey: 'continueWithGoogle' | 'continueWithApple';
}

const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  { provider: 'google', labelKey: 'continueWithGoogle' },
  { provider: 'apple', labelKey: 'continueWithApple' },
];

export function SocialAuthSection({ onError }: SocialAuthSectionProps) {
  const { t } = useTranslation();
  const { signInWithSocial } = useAuth();
  const [activeProvider, setActiveProvider] = useState<SocialAuthProvider | null>(null);

  const visibleProviders = useMemo(
    () =>
      SOCIAL_PROVIDERS.map((entry) => ({
        ...entry,
        label: t(`auth.${entry.labelKey}`),
      })).filter((entry) => {
        if (entry.provider === 'google') {
          return shouldShowGoogleSocialAuthButton();
        }

        return shouldShowAppleSocialAuthButton();
      }),
    [t],
  );

  const handleSocialSignIn = useCallback(
    async (provider: SocialAuthProvider) => {
      if (activeProvider) {
        return;
      }

      onError?.(null);
      setActiveProvider(provider);

      try {
        await signInWithSocial(provider);
      } catch (error) {
        if (error instanceof SocialAuthCancelledError) {
          return;
        }

        if (error instanceof SocialAuthConfigurationError) {
          onError?.(error.message);
          return;
        }

        if (isApiError(error)) {
          onError?.(
            error.detail ?? getUserMessageForAuthError(error.kind, 'social'),
          );
          return;
        }

        onError?.(t('auth.unableToContinueSocialSignIn'));
      } finally {
        setActiveProvider(null);
      }
    },
    [activeProvider, onError, signInWithSocial, t],
  );

  if (visibleProviders.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleProviders.map((entry) => {
        const isLoading = activeProvider === entry.provider;
        const isDisabled = activeProvider !== null && activeProvider !== entry.provider;

        return (
          <Pressable
            key={entry.provider}
            accessibilityRole="button"
            accessibilityLabel={entry.label}
            accessibilityState={{ disabled: isDisabled, busy: isLoading }}
            disabled={isDisabled}
            onPress={() => void handleSocialSignIn(entry.provider)}
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
                <SocialAuthProviderIcon provider={entry.provider} size={22} />
                <AppText variant="body" style={styles.providerLabel}>
                  {entry.label}
                </AppText>
                <View style={styles.providerIconSpacer} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
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
