import type { SocialFeedItem } from '../types';
import { resolveSocialActivityLabelKey } from './social-activity-label';
import { groupConsecutiveEpisodeActivities } from './group-consecutive-episode-activities';
import { isSocialFeedSurfaceActivity } from './social-feed-visibility';

export type SocialFeedTimelineRow =
  | {
      kind: 'activity';
      item: SocialFeedItem;
      presentation: 'compact' | 'review';
      sortAt: string;
    }
  | { kind: 'episode-group'; items: SocialFeedItem[]; sortAt: string };

export function isCompactSocialActivity(item: SocialFeedItem): boolean {
  const label = resolveSocialActivityLabelKey(item.activityType);
  if (label === 'reviewed' && item.reviewExcerpt?.trim()) return false;
  return true;
}

/**
 * Review-centric feed:
 * - Only written reviews surface.
 * - Root comments / nested replies never become their own feed rows
 *   (they only bump commentsCount on the review card).
 */
export function buildSocialFeedTimeline(items: SocialFeedItem[]): SocialFeedTimelineRow[] {
  const activityItems = items.filter((item) => isSocialFeedSurfaceActivity(item));
  const grouped = groupConsecutiveEpisodeActivities(activityItems);
  const activityRows: SocialFeedTimelineRow[] = grouped.map((row) => {
    if (row.kind === 'episode-group') {
      return { kind: 'episode-group', items: row.items, sortAt: row.items[0].createdAt };
    }
    return {
      kind: 'activity',
      item: row.item,
      presentation: isCompactSocialActivity(row.item) ? 'compact' : 'review',
      sortAt: row.item.createdAt,
    };
  });

  return activityRows
    .filter((row) => row.kind === 'activity' && row.presentation === 'review')
    .sort(
      (left, right) => new Date(right.sortAt).getTime() - new Date(left.sortAt).getTime(),
    );
}

export function socialFeedTimelineRowKey(row: SocialFeedTimelineRow): string {
  if (row.kind === 'episode-group') return `episode-compact-${row.items[0].id}`;
  if (row.presentation === 'review') return `review-${row.item.id}`;
  return `compact-${row.item.id}`;
}
