import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/useAuth';
import { UserAvatar } from '@/components/common/UserAvatar';
import { HomeHeaderIconButton } from './HomeHeaderIconButton';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

interface HomeHeaderProfileAvatarProps {
  overlay?: boolean;
  compact?: boolean;
  onPress: () => void;
}

const AVATAR_SIZE = 28;

export function HomeHeaderProfileAvatar({
  overlay = false,
  compact = false,
  onPress,
}: HomeHeaderProfileAvatarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const displayName = user?.displayName ?? t('profile.aboutBrandName');
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
      <UserAvatar
        displayName={displayName}
        effectiveAvatarUrl={user?.effectiveAvatarUrl}
        size={AVATAR_SIZE}
        variant="accent"
        initialsFallback="MA"
        style={overlay ? styles.avatarOverlay : undefined}
        accessibilityLabel={accessibilityLabel}
      />
    </HomeHeaderIconButton>
  );
}

const styles = StyleSheet.create({
  avatarOverlay: {
    backgroundColor: 'rgba(196, 163, 90, 0.2)',
    borderColor: colors.accentStrong,
    borderWidth: 1.5,
    borderRadius: borderRadius.full,
  },
});
