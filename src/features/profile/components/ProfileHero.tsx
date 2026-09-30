import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import type { UserProfileResponse } from '../types';
import { formatIsoDate } from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface ProfileHeroProps {
  profile: UserProfileResponse;
  onEditAvatar?: () => void;
  isAvatarBusy?: boolean;
}

export function ProfileHero({ profile, onEditAvatar, isAvatarBusy = false }: ProfileHeroProps) {
  const { t } = useTranslation();
  const formattedDate = profile.createdAt
    ? formatIsoDate(profile.createdAt.slice(0, 10))
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.avatarEditAccessibility')}
          disabled={!onEditAvatar || isAvatarBusy}
          onPress={onEditAvatar}
          style={({ pressed }) => [pressed && onEditAvatar ? styles.pressed : null]}
        >
          <UserAvatar
            displayName={profile.displayName}
            effectiveAvatarUrl={profile.effectiveAvatarUrl}
            size={64}
            variant="accent"
            textVariant="subtitle"
            initialsFallback="MA"
            accessibilityLabel={t('profile.avatarAccessibility', { name: profile.displayName })}
          />
          {isAvatarBusy ? (
            <View style={styles.avatarBusyOverlay}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null}
        </Pressable>
        {onEditAvatar ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.avatarEditAccessibility')}
            disabled={isAvatarBusy}
            onPress={onEditAvatar}
            style={({ pressed }) => [styles.editBadge, pressed && styles.pressed]}
          >
            <Ionicons name="pencil" size={12} color={colors.background} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.copy}>
        <AppText variant="title" style={styles.name}>
          {profile.displayName}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('profile.identityTagline')}
        </AppText>
        {formattedDate ? (
          <AppText variant="caption" muted>
            {t('profile.memberSince', { date: formattedDate })}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  avatarWrap: {
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarBusyOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
