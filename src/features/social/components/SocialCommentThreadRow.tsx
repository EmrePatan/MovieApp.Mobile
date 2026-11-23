import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import type { SocialComment } from '../types';
import { SocialCommentTranslationBody } from './SocialCommentTranslationBody';
import { socialFeedTheme } from './social-feed-theme';
import { SOCIAL_AVATAR_FEED_ROW, socialUi } from './social-ui-tokens';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface SocialCommentThreadRowProps {
  item: SocialComment;
  isOwnUser: boolean;
  isLikePending: boolean;
  /** Root list only — open one-level reply thread. */
  canOpenReplies?: boolean;
  onLike: () => void;
  onReply: () => void;
  onReport: () => void;
  onDelete: () => void;
}

export const SocialCommentThreadRow = memo(function SocialCommentThreadRow({
  item,
  isOwnUser,
  isLikePending,
  canOpenReplies = true,
  onLike,
  onReply,
  onReport,
  onDelete,
}: SocialCommentThreadRowProps) {
  const { t } = useTranslation();
  const removed = !item.content.trim() || item.content === '[deleted]';
  const likeLabel = item.isLikedByMe ? t('social.unlike') : t('social.like');
  const liked = item.isLikedByMe;
  const timeLabel = formatNotificationRelativeTime(item.createdAt);
  const menuLabel = isOwnUser ? t('social.delete') : t('social.report');
  const onMenuPress = isOwnUser ? onDelete : onReport;

  return (
    <View style={styles.row}>
      <UserAvatar
        displayName={item.displayName}
        effectiveAvatarUrl={item.avatarUrl}
        size={SOCIAL_AVATAR_FEED_ROW}
        textVariant="caption"
        accessibilityLabel={item.displayName}
      />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <AppText numberOfLines={1} style={styles.name} maxFontSizeMultiplier={1.3}>
              {item.displayName}
            </AppText>
            {item.userName ? (
              <AppText numberOfLines={1} style={styles.handle} maxFontSizeMultiplier={1.3}>
                @{item.userName}
              </AppText>
            ) : null}
          </View>
          <View style={styles.headerMeta}>
            {timeLabel ? (
              <AppText style={styles.time} numberOfLines={1}>
                {timeLabel}
              </AppText>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={menuLabel}
              onPress={onMenuPress}
              hitSlop={8}
              style={({ pressed }) => [styles.menuBtn, pressed && socialUi.pressed]}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={socialFeedTheme.textMuted} />
            </Pressable>
          </View>
        </View>

        {removed ? (
          <AppText style={styles.removed}>{t('social.commentRemoved')}</AppText>
        ) : (
          <SocialCommentTranslationBody comment={item} density="thread" />
        )}

        <View style={styles.actions}>
          {isOwnUser ? (
            <View
              style={styles.actionHit}
              accessibilityRole="text"
              accessibilityLabel={`${t('social.like')}: ${item.likesCount}`}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={15}
                color={liked ? socialFeedTheme.accent : socialFeedTheme.textMuted}
              />
              <AppText style={[styles.actionCount, liked && styles.likedCount]}>
                {item.likesCount}
              </AppText>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={likeLabel}
              disabled={isLikePending}
              onPress={onLike}
              hitSlop={8}
              style={({ pressed }) => [styles.actionHit, pressed && socialUi.pressed]}
            >
              {isLikePending ? (
                <ActivityIndicator color={socialFeedTheme.textMuted} size="small" />
              ) : (
                <>
                  <Ionicons
                    name={liked ? 'heart' : 'heart-outline'}
                    size={15}
                    color={liked ? socialFeedTheme.accent : socialFeedTheme.textMuted}
                  />
                  <AppText style={[styles.actionCount, liked && styles.likedCount]}>
                    {item.likesCount}
                  </AppText>
                </>
              )}
            </Pressable>
          )}
          {canOpenReplies ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.reply')}
              onPress={onReply}
              hitSlop={8}
              style={({ pressed }) => [styles.actionHit, pressed && socialUi.pressed]}
            >
              <Ionicons name="chatbubble-outline" size={14} color={socialFeedTheme.textMuted} />
              <AppText style={styles.actionLabel}>
                {t('social.reply')}
                {item.repliesCount > 0 ? ` · ${item.repliesCount}` : ''}
              </AppText>
            </Pressable>
          ) : null}
          {!isOwnUser ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.report')}
              onPress={onReport}
              hitSlop={8}
              style={({ pressed }) => [styles.actionHit, pressed && socialUi.pressed]}
            >
              <Ionicons name="flag-outline" size={14} color={socialFeedTheme.textMuted} />
              <AppText style={styles.actionLabel}>{t('social.report')}</AppText>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.delete')}
              onPress={onDelete}
              hitSlop={8}
              style={({ pressed }) => [styles.actionHit, pressed && socialUi.pressed]}
            >
              <Ionicons name="trash-outline" size={14} color={socialFeedTheme.textMuted} />
              <AppText style={styles.actionLabel}>{t('social.delete')}</AppText>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    padding: spacing.md,
    marginBottom: spacing.sm,
    // Each comment is its own soft glass card instead of a hairline-separated row.
    borderRadius: 20,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.xs,
    minWidth: 0,
  },
  name: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: socialFeedTheme.textPrimary,
  },
  handle: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    color: socialFeedTheme.textMuted,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  time: {
    fontSize: 11,
    lineHeight: 14,
    color: socialFeedTheme.textMuted,
  },
  menuBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removed: {
    fontSize: 14,
    lineHeight: 21,
    color: socialFeedTheme.textMuted,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 28,
  },
  actionHit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 32,
    minWidth: layout.touchTarget * 0.7,
    paddingVertical: 2,
  },
  actionCount: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: socialFeedTheme.textMuted,
    fontVariant: ['tabular-nums'],
  },
  likedCount: {
    color: socialFeedTheme.accent,
  },
  actionLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: socialFeedTheme.textMuted,
  },
});
