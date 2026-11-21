import type { SocialFeedItem } from '../types';
import { resolveSocialActivityLabelKey } from './social-activity-label';

/** Social home feed surface: written reviews only (watch / rate / favorite stay off the timeline). */
export function isSocialFeedSurfaceActivity(item: SocialFeedItem): boolean {
  const label = resolveSocialActivityLabelKey(item.activityType);
  return label === 'reviewed' && Boolean(item.reviewExcerpt?.trim());
}