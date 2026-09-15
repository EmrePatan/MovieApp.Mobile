import { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAuth } from '@/auth/useAuth';
import { getUserMessageForAuthError, isApiError } from '@/api/errors';
import {
  isAppleSocialAuthAvailable,
  isGoogleSocialAuthAvailable,
  SocialAuthCancelledError,
  SocialAuthConfigurationError,
} from '@/auth/social-auth-service';
import { isGoogleSocialAuthConfigured } from '@/auth/social-auth-config';
import type { SocialAuthProvider } from '@/models/api/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SocialAuthSectionProps {
  onError?: (message: string | null) => void;
}

export function SocialAuthSection({ onError }: SocialAuthSectionProps) {
  const { signInWithSocial } = useAuth();
  const [activeProvider, setActiveProvider] = useState<SocialAuthProvider | null>(null);

  const showGoogle = isGoogleSocialAuthAvailable() && isGoogleSocialAuthConfigured();
  const showApple = isAppleSocialAuthAvailable();

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

  if (!showGoogle && !showApple) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <AppText variant="caption" muted style={styles.dividerLabel}>
          or continue with
        </AppText>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.actions}>
        {showGoogle ? (
          <AppButton
            title="Continue with Google"
            variant="secondary"
            onPress={() => void handleSocialSignIn('google')}
            loading={activeProvider === 'google'}
            disabled={activeProvider !== null && activeProvider !== 'google'}
          />
        ) : null}

        {showApple ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={styles.appleButton}
            onPress={() => {
              if (activeProvider) {
                return;
              }

              void handleSocialSignIn('apple');
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
  },
  dividerLabel: {
    textTransform: 'lowercase',
  },
  actions: {
    gap: spacing.sm,
  },
  appleButton: {
    width: '100%',
    height: Platform.OS === 'ios' ? 48 : 0,
  },
});
