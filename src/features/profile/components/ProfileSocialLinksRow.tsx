import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ProfileSocialLinks } from '../types';
import { filledSocialLinks } from '../utils/profile-social-links';
import { ProfileSocialPlatformIcon } from './ProfileSocialPlatformIcon';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

interface ProfileSocialLinksRowProps {
  links: ProfileSocialLinks | null | undefined;
  color?: string;
}

export function ProfileSocialLinksRow({
  links,
  color = colors.textPrimary,
}: ProfileSocialLinksRowProps) {
  const { t } = useTranslation();
  const filled = filledSocialLinks(links);
  if (filled.length === 0) return null;

  return (
    <View style={styles.row} accessibilityRole="list">
      {filled.map(({ platform, url, value }) => {
        const labelKey = `profile.socialPlatform${platform.charAt(0).toUpperCase()}${platform.slice(1)}` as const;
        const label = t(labelKey, { defaultValue: platform });
        return (
          <Pressable
            key={platform}
            accessibilityRole="link"
            accessibilityLabel={`${label}: ${value}`}
            hitSlop={4}
            onPress={() => {
              void Linking.openURL(url);
            }}
            style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}
          >
            <ProfileSocialPlatformIcon platform={platform} size={16} color={color} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconHit: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.panelElevated,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  pressed: {
    opacity: 0.65,
  },
});
