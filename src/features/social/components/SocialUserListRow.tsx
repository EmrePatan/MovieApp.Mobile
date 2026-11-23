import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
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
}

export function SocialUserListRow({
  displayName,
  userName,
  avatarUrl,
  meta,
  onPress,
  trailing,
}: SocialUserListRowProps) {
  const content = (
    <>
      <UserAvatar
        displayName={displayName}
        effectiveAvatarUrl={avatarUrl ?? null}
        size={44}
        accessibilityLabel={displayName}
      />
      <View style={styles.copy}>
        <AppText numberOfLines={1} style={styles.name}>
          {displayName}
        </AppText>
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
    borderRadius: 20,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  name: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  handle: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
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
