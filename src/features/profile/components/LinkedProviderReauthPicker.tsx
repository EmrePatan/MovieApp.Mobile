import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SocialAuthProviderIcon } from '@/features/auth/components/SocialAuthProviderIcon';
import { AppText } from '@/components/common/AppText';
import type { SocialAuthProvider } from '@/models/api/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface LinkedProviderReauthPickerProps {
  providers: SocialAuthProvider[];
  onSelect: (provider: SocialAuthProvider) => void;
  onCancel?: () => void;
}

export function LinkedProviderReauthPicker({
  providers,
  onSelect,
  onCancel,
}: LinkedProviderReauthPickerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" muted>{t('profile.chooseReauthProviderHint')}</AppText>
      {providers.map((provider) => {
        const label =
          provider === 'google' ? t('auth.continueWithGoogle') : t('auth.continueWithApple');

        return (
          <Pressable
            key={provider}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={styles.option}
            onPress={() => onSelect(provider)}
          >
            <SocialAuthProviderIcon provider={provider} size={22} />
            <AppText variant="body">{label}</AppText>
          </Pressable>
        );
      })}
      {onCancel ? (
        <Pressable accessibilityRole="button" onPress={onCancel}>
          <AppText variant="bodySmall" style={styles.cancel}>{t('common.cancel')}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancel: { color: colors.textMuted },
});
