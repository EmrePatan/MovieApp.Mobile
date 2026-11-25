import type { TFunction } from 'i18next';

export function socialNotificationText(type: string, t: TFunction): string {
  switch (type) {
    case 'FollowRequest':
      return t('social.notificationFollowRequest');
    case 'NewFollower':
      return t('social.notificationNewFollower');
    case 'FollowAccepted':
      return t('social.notificationFollowAccepted');
    case 'ActivityLike':
      return t('social.notificationActivityLike');
    case 'NewComment':
      return t('social.notificationNewComment');
    case 'CommentReply':
      return t('social.notificationCommentReply');
    case 'CommentLike':
      return t('social.notificationCommentLike');
    case 'DirectMessage':
      return t('social.notificationDirectMessage');
    default:
      return t('social.notificationGeneric');
  }
}
