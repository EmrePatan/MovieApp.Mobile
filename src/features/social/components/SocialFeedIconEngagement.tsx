import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from '@/components/common/AppText';
import { spacing } from '@/theme/spacing';
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

const ICON_SIZE = 20;

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
  const pop = useSharedValue(1);
  const ring = useSharedValue(0);
  const wasActive = useRef(Boolean(active));

  useEffect(() => {
    // Pop the icon and flash a ring only on the transition to liked, never on first render.
    if (active && !wasActive.current) {
      pop.set(withSequence(withSpring(1.45, { damping: 6, stiffness: 400 }), withSpring(1)));
      ring.set(withSequence(withTiming(1, { duration: 0 }), withTiming(0, { duration: 420 })));
    }
    wasActive.current = Boolean(active);
  }, [active, pop, ring]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.get() * 0.7,
    transform: [{ scale: 1 + (1 - ring.get()) * 1.1 }],
  }));

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
          <View style={styles.iconSlot}>
            <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />
            <Animated.View style={iconStyle}>
              <Ionicons name={icon} size={ICON_SIZE} color={iconColor} />
            </Animated.View>
          </View>
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
    gap: spacing.lg,
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
    paddingVertical: spacing.xs,
  },
  iconSlot: {
    width: ICON_SIZE + 6,
    height: ICON_SIZE + 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: ICON_SIZE + 6,
    height: ICON_SIZE + 6,
    borderRadius: (ICON_SIZE + 6) / 2,
    borderWidth: 2,
    borderColor: socialFeedTheme.accent,
  },
  pillActive: {},
  pillMuted: {},
  count: {
    fontSize: 13,
    lineHeight: 18,
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
