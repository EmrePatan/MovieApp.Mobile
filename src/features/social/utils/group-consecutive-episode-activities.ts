import type { SocialFeedItem } from '../types';
import { isWatchedEpisodeActivityType } from './social-activity-label';

export type SocialFeedListItem =
  | { kind: 'activity'; item: SocialFeedItem }
  | { kind: 'episode-group'; items: SocialFeedItem[] };

export function groupConsecutiveEpisodeActivities(items: SocialFeedItem[]): SocialFeedListItem[] {
  const result: SocialFeedListItem[] = [];
  for (let index = 0; index < items.length;) {
    const first = items[index];
    const isEpisode = isWatchedEpisodeActivityType(first.activityType);
    if (!isEpisode) {
      result.push({ kind: 'activity', item: first });
      index += 1;
      continue;
    }
    const group = [first];
    let next = index + 1;
    while (next < items.length) {
      const candidate = items[next];
      const candidateIsEpisode = isWatchedEpisodeActivityType(candidate.activityType);
      const withinOneDay =
        Math.abs(new Date(first.createdAt).getTime() - new Date(candidate.createdAt).getTime()) <=
        86400000;
      const sameShow =
        candidate.targetTitle.length > 0 && candidate.targetTitle === first.targetTitle;
      if (
        candidateIsEpisode &&
        candidate.actorId === first.actorId &&
        sameShow &&
        withinOneDay
      ) {
        group.push(candidate);
        next += 1;
      } else {
        break;
      }
    }
    result.push(group.length > 1 ? { kind: 'episode-group', items: group } : { kind: 'activity', item: first });
    index = next;
  }
  return result;
}