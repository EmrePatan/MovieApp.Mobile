import { StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { ProfileSocialPlatform } from '../types';
import { PROFILE_SOCIAL_PLATFORMS } from '../utils/profile-social-links';
import { ProfileSocialPlatformIcon } from './ProfileSocialPlatformIcon';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ProfileSocialLinksEditorProps {
  values: Record<ProfileSocialPlatform, string>;
  errors?: Partial<Record<ProfileSocialPlatform, string>>;
  onChange: (platform: ProfileSocialPlatform, value: string) => void;
}

function platformLabelKey(platform: ProfileSocialPlatform): string {
  return `profile.socialPlatform${platform.charAt(0).toUpperCase()}${platform.slice(1)}`;
}

export function ProfileSocialLinksEditor({
  values,
  errors,
  onChange,
}: ProfileSocialLinksEditorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <AppText variant="bodySmall" style={styles.title}>
        {t('profile.socialLinksTitle')}
      </AppText>
      <View style={styles.card}>
        {PROFILE_SOCIAL_PLATFORMS.map((platform, index) => {
          const isWebsite = platform === 'website';
          const label = t(platformLabelKey(platform));
          const error = errors?.[platform];
          return (
            <View key={platform}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <ProfileSocialPlatformIcon platform={platform} size={18} color={colors.textPrimary} />
                <TextInput
                  accessibilityLabel={label}
                  value={values[platform]}
                  onChangeText={(text) => onChange(platform, text)}
                  placeholder={
                    isWebsite
                      ? t('profile.socialWebsitePlaceholder')
                      : t('profile.socialHandlePlaceholder')
                  }
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={isWebsite ? 'url' : 'default'}
                  style={[styles.input, error ? styles.inputError : null]}
                />
              </View>
              {error ? (
                <AppText variant="caption" style={styles.error} accessibilityRole="alert">
                  {error}
                </AppText>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    paddingVertical: spacing.sm,
  },
  inputError: {
    color: colors.error,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.md + 18 + spacing.md,
  },
  error: {
    color: colors.error,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
});
