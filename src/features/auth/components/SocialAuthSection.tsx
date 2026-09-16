import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
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
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface SocialAuthSectionProps {
  onError?: (message: string | null) => void;
}

interface SocialProviderConfig {
  provider: SocialAuthProvider;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  { provider: 'google', label: 'Google', icon: 'logo-google' },
  { provider: 'apple', label: 'Apple', icon: 'logo-apple' },
];

export function SocialAuthSection({ onError }: SocialAuthSectionProps) {
  const { signInWithSocial } = useAuth();
  const [activeProvider, setActiveProvider] = useState<SocialAuthProvider | null>(null);

  const visibleProviders = SOCIAL_PROVIDERS.filter((entry) => {
    if (entry.provider === 'google') {
      return shouldShowGoogleSocialAuthButton();
    }

    return shouldShowAppleSocialAuthButton();
  });

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
          onError?.(getUserMessageForAuthError(error.kind, 'social'));
          return;
        }

        onError?.('Unable to continue with social sign-in. Please try again.');
      } finally {
        setActiveProvider(null);
      }
    },
    [activeProvider, onError, signInWithSocial],
  );

  if (visibleProviders.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" muted center style={styles.heading}>
        Continue in one tap
      </AppText>

      <View style={styles.providerRow}>
        {visibleProviders.map((entry) => {
          const isLoading = activeProvider === entry.provider;
          const isDisabled = activeProvider !== null && activeProvider !== entry.provider;

          return (
            <Pressable
              key={entry.provider}
              accessibilityRole="button"
              accessibilityLabel={`Continue with ${entry.label}`}
              accessibilityState={{ disabled: isDisabled, busy: isLoading }}
              disabled={isDisabled}
              onPress={() => void handleSocialSignIn(entry.provider)}
              style={({ pressed }) => [
                styles.providerChip,
                pressed && !isDisabled && styles.providerChipPressed,
                isDisabled && styles.providerChipDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <>
                  <View style={styles.iconBadge}>
                    <Ionicons name={entry.icon} size={16} color={colors.textPrimary} />
                  </View>
                  <AppText variant="bodySmall" style={styles.providerLabel}>
                    {entry.label}
                  </AppText>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  heading: {
    letterSpacing: 0.3,
  },
  providerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  providerChip: {
    flex: 1,
    minHeight: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  providerChipPressed: {
    opacity: interaction.pressedOpacity,
    borderColor: colors.borderAccent,
  },
  providerChipDisabled: {
    opacity: interaction.disabledOpacity,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint14,
  },
  providerLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
