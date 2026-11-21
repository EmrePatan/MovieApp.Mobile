import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import { SOCIAL_AVATAR, SOCIAL_AVATAR_FEED, socialUi } from './social-ui-tokens';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SocialActivityHeaderProps {
  displayName: string;
  avatarUrl: string | null;
  metaLine: string;
  menuLabel: string;
  onDark?: boolean;
  compact?: boolean;
  onProfilePress: () => void;
  onMenuPress: () => void;
}

export function SocialActivityHeader({
  displayName,
  avatarUrl,
  metaLine,
  menuLabel,
  onDark = false,
  compact = false,
  onProfilePress,
  onMenuPress,
}: SocialActivityHeaderProps) {
  const avatarSize = compact ? SOCIAL_AVATAR_FEED : SOCIAL_AVATAR;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={displayName}
        onPress={onProfilePress}
        style={({ pressed }) => [styles.main, pressed && socialUi.pressed]}
      >
        <UserAvatar
          displayName={displayName}
          effectiveAvatarUrl={avatarUrl}
          size={avatarSize}
          textVariant={compact ? 'caption' : undefined}
          accessibilityLabel={displayName}
        />
        <View style={styles.copy}>
          {compact ? (
            <AppText variant="caption" numberOfLines={2} style={onDark ? styles.metaOnDark : undefined}>
              <AppText variant="caption" style={[styles.name, onDark && styles.nameOnDark]}>
                {displayName}
              </AppText>
              <AppText variant="caption" muted={!onDark}>
                {` · ${metaLine}`}
              </AppText>
            </AppText>
          ) : (
            <>
              <AppText
                variant="bodySmall"
                style={[styles.name, onDark && styles.nameOnDark]}
                numberOfLines={1}
              >
                {displayName}
              </AppText>
              <AppText
                variant="caption"
                style={onDark ? styles.metaOnDark : undefined}
                muted={!onDark}
                numberOfLines={2}
              >
                {metaLine}
              </AppText>
            </>
          )}
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={menuLabel}
        onPress={onMenuPress}
        hitSlop={8}
        style={({ pressed }) => [styles.menu, pressed && socialUi.pressed]}
      >
        <Ionicons name="ellipsis-horizontal" size={compact ? 16 : 18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 0,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: '600',
  },
  nameOnDark: {
    color: colors.textPrimary,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaOnDark: {
    color: colors.textSecondary,
  },
  menu: {
    padding: 2,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});