import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/useAuth';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useProfileAvatarEditor } from '@/features/profile/hooks/useProfileAvatarEditor';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const AVATAR_SIZE = 76;

/**
 * Profile photo, shown the way the profile screen shows it: a ring-framed avatar
 * overlapping the cover above. Tapping opens the same photo actions as the profile.
 */
export function ProfileAvatarEditor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profileQuery = useCurrentProfile();
  const profile = profileQuery.data;
  const { openAvatarActions, isAvatarBusy } = useProfileAvatarEditor(profile);

  const displayName = profile?.displayName ?? user?.displayName ?? '';
  const avatarUrl = profile?.effectiveAvatarUrl ?? user?.effectiveAvatarUrl ?? null;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('profile.avatarEditTitle')}
        onPress={openAvatarActions}
        disabled={isAvatarBusy}
        style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
        testID="profile-avatar-editor"
      >
        <View style={styles.ring}>
          <UserAvatar
            displayName={displayName}
            effectiveAvatarUrl={avatarUrl}
            size={AVATAR_SIZE}
            textVariant="subtitle"
            accessibilityLabel={displayName}
          />
          <GlassSurface style={styles.badge}>
            {isAvatarBusy ? (
              <ActivityIndicator color={colors.textPrimary} size="small" />
            ) : (
              <Ionicons name="camera" size={12} color={colors.textPrimary} />
            )}
          </GlassSurface>
        </View>
      </Pressable>
      <AppText variant="bodySmall" muted style={styles.hint}>
        {t('profile.avatarEditTitle')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    // Pull the avatar up so it overlaps the cover frame, like on the profile.
    marginTop: -(AVATAR_SIZE / 2 + spacing.lg),
  },
  hit: {
    borderRadius: 999,
  },
  ring: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.background,
    padding: 2,
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    paddingBottom: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
