import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import { SocialUserLevelSeal } from './SocialUserLevelSeal';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

interface SocialUserListRowProps {
  displayName: string;
  userName: string;
  avatarUrl?: string | null;
  meta?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  /** Gold ring around the avatar, e.g. for people the viewer follows. */
  highlighted?: boolean;
  /** Profile id; shows the level seal next to the name when given. */
  userId?: string;
}

export function SocialUserListRow({
  displayName,
  userName,
  avatarUrl,
  meta,
  onPress,
  trailing,
  highlighted = false,
  userId,
}: SocialUserListRowProps) {
  const content = (
    <>
      <View style={[styles.ring, highlighted && styles.ringActive]}>
        <UserAvatar
          displayName={displayName}
          effectiveAvatarUrl={avatarUrl ?? null}
          size={52}
          textVariant="subtitle"
          accessibilityLabel={displayName}
        />
      </View>
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <AppText numberOfLines={1} style={styles.name}>
            {displayName}
          </AppText>
          {userId ? <SocialUserLevelSeal userId={userId} size={20} /> : null}
        </View>
        <AppText numberOfLines={1} style={styles.handle}>
          @{userName}
        </AppText>
        {meta ? (
          <AppText numberOfLines={1} style={styles.meta}>
            {meta}
          </AppText>
        ) : null}
      </View>
      {trailing}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${displayName} @${userName}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 22,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  ring: {
    padding: 2,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: glass.hairline,
  },
  ringActive: {
    borderColor: colors.accent,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  handle: {
    fontSize: 13,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
    paddingTop: 2,
  },
  pressed: {
    opacity: 0.88,
  },
});
