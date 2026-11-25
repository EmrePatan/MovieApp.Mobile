import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { ProfileSocialPlatform } from '../types';
import { PROFILE_SOCIAL_PLATFORMS } from '../utils/profile-social-links';
import { ProfileSocialPlatformIcon } from './ProfileSocialPlatformIcon';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ProfileSocialLinksEditorProps {
  values: Record<ProfileSocialPlatform, string>;
  errors?: Partial<Record<ProfileSocialPlatform, string>>;
  onChange: (platform: ProfileSocialPlatform, value: string) => void;
}

/** Always visible; everything else sits behind "more" unless it already has a value. */
const PRIMARY_PLATFORMS: readonly ProfileSocialPlatform[] = [
  'instagram',
  'snapchat',
  'tiktok',
  'youtube',
];

function platformLabelKey(platform: ProfileSocialPlatform): string {
  return `profile.socialPlatform${platform.charAt(0).toUpperCase()}${platform.slice(1)}`;
}

export function ProfileSocialLinksEditor({
  values,
  errors,
  onChange,
}: ProfileSocialLinksEditorProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const secondary = PROFILE_SOCIAL_PLATFORMS.filter((p) => !PRIMARY_PLATFORMS.includes(p));
  // Filled secondary platforms must stay visible so existing data is never hidden.
  const filledSecondary = secondary.filter((p) => values[p].trim().length > 0 || errors?.[p]);
  const visible = expanded
    ? [...PRIMARY_PLATFORMS, ...secondary]
    : [...PRIMARY_PLATFORMS, ...filledSecondary];
  const hiddenCount = secondary.length - (expanded ? secondary.length : filledSecondary.length);
  const canToggle = expanded || hiddenCount > 0;

  return (
    <View style={styles.wrap}>
      <AppText variant="bodySmall" style={styles.title}>
        {t('profile.socialLinksTitle')}
      </AppText>
      <View style={styles.card}>
        {visible.map((platform, index) => {
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
      {canToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? t('profile.socialLinksLess') : t('profile.socialLinksMore')}
          onPress={() => setExpanded((v) => !v)}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
        >
          <Ionicons name={expanded ? 'chevron-up' : 'add'} size={16} color={colors.accent} />
          <AppText variant="bodySmall" style={styles.moreLabel}>
            {expanded ? t('profile.socialLinksLess') : t('profile.socialLinksMore')}
          </AppText>
        </Pressable>
      ) : null}
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
    backgroundColor: glass.panelInput,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: glass.hairline,
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
  more: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  moreLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
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
