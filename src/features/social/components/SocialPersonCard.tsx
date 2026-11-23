import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/useAuth';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useFollowSocialUser, useUnfollowSocialUser } from '../hooks/useSocialMutations';
import type { SocialUserSummary } from '../types';
import { SocialConfirmActionSheet } from './SocialConfirmActionSheet';
import { SocialUserLevelSeal } from './SocialUserLevelSeal';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';

const AVATAR = 52;

interface SocialPersonCardProps {
  user: SocialUserSummary;
  onPress: () => void;
}

/** Follower / following list row: ringed avatar, name with level seal, and the viewer's follow state. */
export function SocialPersonCard({ user, onPress }: SocialPersonCardProps) {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const follow = useFollowSocialUser(user.id);
  const unfollow = useUnfollowSocialUser(user.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const status = user.followStatus;
  const busy = follow.isPending || unfollow.isPending;
  const isFollowing = status === 'Accepted';

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${user.displayName} @${user.userName}`}
        onPress={onPress}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={[styles.ring, isFollowing && styles.ringActive]}>
          <UserAvatar
            displayName={user.displayName}
            effectiveAvatarUrl={user.avatarUrl}
            size={AVATAR}
            textVariant="subtitle"
            accessibilityLabel={user.displayName}
          />
        </View>

        <View style={styles.copy}>
          <View style={styles.nameRow}>
            <AppText numberOfLines={1} style={styles.name}>
              {user.displayName}
            </AppText>
            <SocialUserLevelSeal userId={user.id} size={20} />
          </View>
          <AppText numberOfLines={1} style={styles.handle}>
            @{user.userName}
          </AppText>
        </View>
      </Pressable>

      {status === 'Self' || user.id === me?.id ? null : status === 'Accepted' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.unfollow')}
          onPress={() => setConfirmOpen(true)}
          hitSlop={6}
          style={({ pressed }) => [styles.stateChip, pressed && styles.pressed]}
        >
          <Ionicons name="checkmark" size={14} color={colors.accentStrong} />
          <AppText style={styles.stateText} numberOfLines={1}>
            {t('social.followingState')}
          </AppText>
        </Pressable>
      ) : status === 'Pending' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.cancelFollowRequest')}
          disabled={busy}
          onPress={() => unfollow.mutate()}
          hitSlop={6}
          style={({ pressed }) => [styles.circle, pressed && styles.pressed]}
        >
          {busy ? (
            <ActivityIndicator color={colors.textPrimary} size="small" />
          ) : (
            <Ionicons name="time-outline" size={18} color={colors.textPrimary} />
          )}
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.follow')}
          disabled={busy}
          onPress={() => follow.mutate()}
          hitSlop={6}
          style={({ pressed }) => [styles.followPill, pressed && styles.pressed]}
        >
          {busy ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <>
              <Ionicons name="person-add" size={14} color={colors.background} />
              <AppText style={styles.followText} numberOfLines={1}>
                {t('social.follow')}
              </AppText>
            </>
          )}
        </Pressable>
      )}
      <SocialConfirmActionSheet
        visible={confirmOpen}
        title={t('social.unfollow')}
        message={`${user.displayName} (@${user.userName})`}
        confirmLabel={t('social.unfollow')}
        destructive
        confirmLoading={unfollow.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>
          unfollow.mutate(undefined, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  main: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
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
  stateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: glass.accentFill,
    borderWidth: 1,
    borderColor: glass.accentBorder,
  },
  stateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentStrong,
  },
  followPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentStrong,
  },
  followText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.background,
  },
  circle: {
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
    opacity: 0.85,
  },
});
