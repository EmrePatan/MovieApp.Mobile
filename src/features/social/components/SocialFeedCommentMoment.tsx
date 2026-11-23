import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import type { SocialComment, SocialFeedItem } from '../types';
import { SocialCommentTranslationBody } from './SocialCommentTranslationBody';
import { SocialFeedIconEngagement } from './SocialFeedIconEngagement';
import {
  formatSocialEmbedSubtitle,
  socialContentTypeLabel,
} from '../utils/social-feed-embed';
import { resolveCommentMomentPosterRating } from '../utils/resolve-comment-moment-poster-rating';
import { SocialFeedEntry } from './SocialFeedEntry';

interface SocialFeedCommentMomentProps {
  activity: SocialFeedItem;
  comment: SocialComment;
  isOwnComment: boolean;
  isLiking: boolean;
  likeLabel: string;
  unlikeLabel: string;
  onOpenThread: () => void;
  onOpenActivity: () => void;
  onCommentAuthor: () => void;
  onActivityAuthor: () => void;
  onLikeComment: () => void;
  onReport: () => void;
}

export const SocialFeedCommentMoment = memo(function SocialFeedCommentMoment({
  activity,
  comment,
  isOwnComment,
  isLiking,
  likeLabel,
  unlikeLabel,
  onOpenThread,
  onOpenActivity,
  onCommentAuthor,
  onLikeComment,
  onReport,
}: SocialFeedCommentMomentProps) {
  const { t } = useTranslation();
  const time = formatNotificationRelativeTime(comment.createdAt);
  const title = activity.targetTitle || t('social.contentFallback');
  const subtitle = formatSocialEmbedSubtitle(activity, t);
  const authorRating = resolveCommentMomentPosterRating(activity, comment);
  const ownerName =
    activity.highlightCommentParentDisplayName?.trim() ||
    activity.displayName?.trim() ||
    t('social.contentFallback');
  const titleOpenLabel = t('social.feedStyle.openActivity', {
    owner: ownerName,
    title,
  });
  const metaChips = useMemo(() => {
    const chips: string[] = [];
    const typeLabel = socialContentTypeLabel(activity.targetContentType, t);
    if (subtitle) {
      // Prefer episode/year line as chips when present; otherwise content type.
      for (const part of subtitle.split(/[·•|,]/).map((p) => p.trim()).filter(Boolean)) {
        chips.push(part);
      }
    }
    if (chips.length === 0) chips.push(typeLabel);
    return chips.slice(0, 3);
  }, [activity.targetContentType, subtitle, t]);

  return (
    <SocialFeedEntry
      chrome="flat"
      displayName={comment.displayName}
      authorId={comment.userId}
      avatarUrl={comment.avatarUrl}
      timeLabel={time}
      title={title}
      originalTitle={activity.targetOriginalTitle}
      metaChips={metaChips}
      posterPath={activity.posterPath}
      ratingScore={authorRating}
      titleOpenLabel={titleOpenLabel}
      onProfilePress={onCommentAuthor}
      onOpenTitle={onOpenActivity}
      onMenuPress={isOwnComment ? undefined : onReport}
      menuLabel={t('social.report')}
      body={<SocialCommentTranslationBody comment={comment} density="feed" />}
      engagement={
        <SocialFeedIconEngagement
          likeLabel={likeLabel}
          unlikeLabel={unlikeLabel}
          commentLabel={t('social.replies')}
          likesCount={comment.likesCount}
          commentsCount={comment.repliesCount}
          isLiked={comment.isLikedByMe}
          isLiking={isLiking}
          likeDisabled={isOwnComment}
          onLike={isOwnComment ? undefined : onLikeComment}
          onComments={onOpenThread}
        />
      }
    />
  );
});
