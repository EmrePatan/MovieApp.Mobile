import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import type { SocialComment } from '../types';
import { SocialCommentTranslationBody } from './SocialCommentTranslationBody';
import { socialFeedTheme } from './social-feed-theme';
import { SOCIAL_AVATAR_FEED_ROW } from './social-ui-tokens';
import { borderRadius, spacing } from '@/theme/spacing';

interface SocialCommentParentBannerProps {
  comment: SocialComment;
}

/** Shown above a reply list so the parent isn't lost when the stack swaps. */
export function SocialCommentParentBanner({ comment }: SocialCommentParentBannerProps) {
  const { t } = useTranslation();
  const removed = !comment.content.trim() || comment.content === '[deleted]';

  return (
    <View style={styles.wrap}>
      <AppText style={styles.label}>{t('social.replyingTo')}</AppText>
      <View style={styles.card}>
        <UserAvatar
          displayName={comment.displayName}
          effectiveAvatarUrl={comment.avatarUrl}
          size={SOCIAL_AVATAR_FEED_ROW}
          textVariant="caption"
          accessibilityLabel={comment.displayName}
        />
        <View style={styles.copy}>
          <AppText numberOfLines={1} style={styles.name}>
            {comment.displayName}
          </AppText>
          {comment.userName ? (
            <AppText numberOfLines={1} style={styles.handle}>
              @{comment.userName}
            </AppText>
          ) : null}
          {removed ? (
            <AppText style={styles.removed}>{t('social.commentRemoved')}</AppText>
          ) : (
            <View style={styles.body}>
              <SocialCommentTranslationBody comment={comment} density="quote" />
            </View>
          )}
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: socialFeedTheme.border,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: socialFeedTheme.textSecondary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    backgroundColor: socialFeedTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: socialFeedTheme.border,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: socialFeedTheme.textPrimary,
  },
  handle: {
    fontSize: 12,
    lineHeight: 16,
    color: socialFeedTheme.textMuted,
  },
  body: {
    marginTop: spacing.xs,
    maxWidth: '100%',
  },
  removed: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
    color: socialFeedTheme.textMuted,
  },
});
