import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SocialFeedItem } from '../types';
import type { SocialFeedTimelineRow } from '../utils/social-feed-presentation';
import { SocialFeedMoment } from './SocialFeedMoment';

export interface SocialFeedTimelineRowViewProps {
  row: SocialFeedTimelineRow;
  currentUserId?: string;
  isActivityLiking: (activityId: string) => boolean;
  onLikeActivity: (item: SocialFeedItem) => void;
  onOpenProfile: (item: SocialFeedItem) => void;
  onOpenComments: (item: SocialFeedItem) => void;
  onOpenActivity: (item: SocialFeedItem) => void;
  onReportActivity: (item: SocialFeedItem) => void;
}

export const SocialFeedTimelineRowView = memo(function SocialFeedTimelineRowView({
  row,
  currentUserId,
  isActivityLiking,
  onLikeActivity,
  onOpenProfile,
  onOpenComments,
  onOpenActivity,
  onReportActivity,
}: SocialFeedTimelineRowViewProps) {
  const { t } = useTranslation();

  if (row.kind === 'activity' && row.presentation === 'review') {
    return (
      <SocialFeedMoment
        item={row.item}
        isOwnActivity={row.item.actorId === currentUserId}
        isLiking={isActivityLiking(row.item.id)}
        likeLabel={t('social.like')}
        unlikeLabel={t('social.unlike')}
        commentsLabel={t('social.commentsCount')}
        reportLabel={t('social.report')}
        onLike={() => onLikeActivity(row.item)}
        onProfile={() => onOpenProfile(row.item)}
        onComments={() => onOpenComments(row.item)}
        onActivity={() => onOpenActivity(row.item)}
        onReport={() => onReportActivity(row.item)}
      />
    );
  }

  return null;
});
