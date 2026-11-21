import type { TFunction } from 'i18next';
import type { SocialFeedItem } from '../types';
import { socialActivityFeedVerbI18nKey } from './social-activity-feed-verb';

export function formatActivityTweetText(t: TFunction, item: SocialFeedItem): string {
  const title = item.targetTitle || t('social.contentFallback');
  const verb = t(socialActivityFeedVerbI18nKey(item.activityType));
  const rating =
    item.ratingScore !== null && item.ratingScore !== undefined ? ` · ★ ${item.ratingScore}` : '';
  return `${verb} · ${title}${rating}`;
}