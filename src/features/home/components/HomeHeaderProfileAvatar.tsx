import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/auth/useAuth';
import { HomeHeaderIconButton } from './HomeHeaderIconButton';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

interface HomeHeaderProfileAvatarProps {
  overlay?: boolean;
  compact?: boolean;
  onPress: () => void;
}

const AVATAR_SIZE = 28;

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'MA';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function HomeHeaderProfileAvatar({
  overlay = false,
  compact = false,
  onPress,
}: HomeHeaderProfileAvatarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const displayName = user?.displayName ?? 'MovieApp';
  const initials = getInitials(displayName);
  const accessibilityLabel = user
    ? t('common.openProfileNamed', { name: displayName })
    : t('common.openProfile');

  return (
    <HomeHeaderIconButton
      accessibilityLabel={accessibilityLabel}
      overlay={overlay}
      compact={compact}
      onPress={onPress}
    >
      <View
        style={[styles.avatar, overlay && styles.avatarOverlay]}
        accessibilityLabel={`${displayName} avatar`}
      >
        <AppText variant="caption" style={styles.initials}>
          {initials}
        </AppText>
      </View>
    </HomeHeaderIconButton>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    backgroundColor: 'rgba(196, 163, 90, 0.2)',
    borderColor: colors.accentStrong,
  },
  initials: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.2,
  },
});
