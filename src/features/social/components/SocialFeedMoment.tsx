import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReviewRichBody } from '@/features/reviews/components/ReviewRichBody';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import { socialFeedItemToReviewStub } from '../utils/social-feed-review-stub';
import {
  formatSocialEmbedSubtitle,
  socialContentTypeLabel,
} from '../utils/social-feed-embed';
import type { SocialFeedItem } from '../types';
import { SocialFeedIconEngagement } from './SocialFeedIconEngagement';
import { SocialFeedBodyText, SocialFeedEntry } from './SocialFeedEntry';

interface SocialFeedMomentProps {
  item: SocialFeedItem;
  isOwnActivity: boolean;
  isLiking: boolean;
  likeLabel: string;
  unlikeLabel: string;
  commentsLabel: string;
  reportLabel?: string;
  onLike: () => void;
  onProfile: () => void;
  onComments: () => void;
  onActivity: () => void;
  onReport?: () => void;
}

export const SocialFeedMoment = memo(function SocialFeedMoment({
  item,
  isOwnActivity,
  isLiking,
  likeLabel,
  unlikeLabel,
  commentsLabel,
  reportLabel,
  onLike,
  onProfile,
  onComments,
  onActivity,
  onReport,
}: SocialFeedMomentProps) {
  const { t } = useTranslation();
  const time = formatNotificationRelativeTime(item.createdAt);
  const title = item.targetTitle || t('social.contentFallback');
  const quote = item.reviewExcerpt?.trim() ?? '';
  const reviewStub = socialFeedItemToReviewStub(item);
  const subtitle = formatSocialEmbedSubtitle(item, t);
  const titleOpenLabel = t('social.openInCatalog');
  const metaChips = useMemo(() => {
    const chips: string[] = [];
    if (subtitle) {
      for (const part of subtitle.split(/[·•|,]/).map((p) => p.trim()).filter(Boolean)) {
        chips.push(part);
      }
    }
    if (chips.length === 0) chips.push(socialContentTypeLabel(item.targetContentType, t));
    return chips.slice(0, 3);
  }, [item.targetContentType, subtitle, t]);

  return (
    <SocialFeedEntry
      chrome="flat"
      displayName={item.displayName}
      avatarUrl={item.avatarUrl}
      timeLabel={time}
      title={title}
      originalTitle={item.targetOriginalTitle}
      metaChips={metaChips}
      posterPath={item.posterPath}
      ratingScore={item.ratingScore}
      titleOpenLabel={`${title}. ${titleOpenLabel}`}
      onProfilePress={onProfile}
      onOpenTitle={onActivity}
      onMenuPress={isOwnActivity || !onReport ? undefined : onReport}
      menuLabel={reportLabel}
      body={
        reviewStub ? (
          <ReviewRichBody
            content={reviewStub.content}
            review={reviewStub}
            textVariant="body"
            numberOfLines={8}
          />
        ) : (
          <SocialFeedBodyText text={quote} />
        )
      }
      engagement={
        <SocialFeedIconEngagement
          likeLabel={likeLabel}
          unlikeLabel={unlikeLabel}
          commentLabel={commentsLabel}
          likesCount={item.likesCount}
          commentsCount={item.commentsCount}
          isLiked={item.isLikedByMe}
          isLiking={isLiking}
          likeDisabled={isOwnActivity}
          onLike={isOwnActivity ? undefined : onLike}
          onComments={onComments}
        />
      }
    />
  );
});
