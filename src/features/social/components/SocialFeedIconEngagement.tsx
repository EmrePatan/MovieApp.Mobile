import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { borderRadius, spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';
import { socialUi } from './social-ui-tokens';

interface SocialFeedIconEngagementProps {
  likeLabel: string;
  unlikeLabel: string;
  commentLabel: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked: boolean;
  isLiking?: boolean;
  /** Own content: show like icon + count, but do not allow liking. */
  likeDisabled?: boolean;
  onLike?: () => void;
  onComments: () => void;
  /** Optional trailing action (e.g. bookmark) — rendered on the right when provided. */
  trailingAction?: ReactNode;
}

const ICON_SIZE = 16;

function ActionPill({
  active,
  muted,
  loading,
  label,
  count,
  icon,
  onPress,
  disabled,
}: {
  active?: boolean;
  muted?: boolean;
  loading?: boolean;
  label: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const iconColor = muted
    ? socialFeedTheme.textMuted
    : active
      ? socialFeedTheme.accent
      : socialFeedTheme.textSecondary;
  const content = (
    <View style={[styles.pill, active && styles.pillActive, muted && styles.pillMuted]}>
      {loading ? (
        <ActivityIndicator color={socialFeedTheme.textMuted} size="small" />
      ) : (
        <>
          <Ionicons name={icon} size={ICON_SIZE} color={iconColor} />
          <AppText style={[styles.count, active && styles.countActive, muted && styles.countMuted]}>
            {count}
          </AppText>
        </>
      )}
    </View>
  );

  if (!onPress || disabled) {
    return (
      <View accessibilityRole="text" accessibilityLabel={`${label}: ${count}`}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [pressed && socialUi.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function SocialFeedIconEngagement({
  likeLabel,
  unlikeLabel,
  commentLabel,
  likesCount = 0,
  commentsCount = 0,
  isLiked,
  isLiking = false,
  likeDisabled = false,
  onLike,
  onComments,
  trailingAction,
}: SocialFeedIconEngagementProps) {
  const canLike = Boolean(onLike) && !likeDisabled;

  return (
    <View style={styles.row}>
      <View style={styles.cluster}>
        <ActionPill
          label={canLike && isLiked ? unlikeLabel : likeLabel}
          count={likesCount}
          icon={isLiked ? 'heart' : 'heart-outline'}
          active={isLiked && !likeDisabled}
          muted={likeDisabled || !canLike}
          loading={canLike && isLiking}
          onPress={canLike ? onLike : undefined}
          disabled={!canLike}
        />
        <ActionPill
          label={commentLabel}
          count={commentsCount}
          icon="chatbubble-ellipses-outline"
          onPress={onComments}
        />
      </View>
      {trailingAction ? <View style={styles.trailing}>{trailingAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 36,
  },
  cluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  trailing: {
    flexShrink: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: socialFeedTheme.pillBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: socialFeedTheme.pillBorder,
  },
  pillActive: {
    backgroundColor: socialFeedTheme.pillActiveBackground,
    borderColor: socialFeedTheme.accentMuted,
  },
  pillMuted: {
    borderColor: socialFeedTheme.borderSubtle,
    backgroundColor: socialFeedTheme.surfaceSecondary,
  },
  count: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: socialFeedTheme.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  countActive: {
    color: socialFeedTheme.textPrimary,
  },
  countMuted: {
    color: socialFeedTheme.textMuted,
  },
});
