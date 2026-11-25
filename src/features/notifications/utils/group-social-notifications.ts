import type { SocialNotificationItem } from '@/features/social/types';

export interface SocialNotificationGroup {
  key: string;
  /** Newest item of the group; drives avatar, name, time and navigation. */
  lead: SocialNotificationItem;
  items: SocialNotificationItem[];
  /** Distinct actors other than the lead. */
  otherActorCount: number;
  hasUnread: boolean;
}

/** Notification kinds that pile up on one target and read better merged. */
const GROUPABLE_TYPES = new Set(['ActivityLike', 'CommentLike', 'NewComment', 'CommentReply']);

function groupKey(item: SocialNotificationItem): string | null {
  if (!GROUPABLE_TYPES.has(item.notificationType)) {
    return null;
  }
  const target = item.parentCommentId ?? item.commentId ?? item.activityId;
  return target ? `${item.notificationType}:${item.activityId ?? ''}:${target}` : null;
}

/**
 * Merges "X liked", "Y liked", "Z liked" on one target into a single row.
 * Order follows each group's newest item; the input is expected newest first.
 */
export function groupSocialNotifications(
  items: SocialNotificationItem[],
): SocialNotificationGroup[] {
  const groups: SocialNotificationGroup[] = [];
  const byKey = new Map<string, SocialNotificationGroup>();

  for (const item of items) {
    const key = groupKey(item);
    const existing = key ? byKey.get(key) : undefined;

    if (existing) {
      existing.items.push(item);
      existing.hasUnread = existing.hasUnread || !item.isRead;
      continue;
    }

    const group: SocialNotificationGroup = {
      key: key ?? item.id,
      lead: item,
      items: [item],
      otherActorCount: 0,
      hasUnread: !item.isRead,
    };
    groups.push(group);
    if (key) {
      byKey.set(key, group);
    }
  }

  for (const group of groups) {
    const others = new Set(
      group.items.map((entry) => entry.actorId).filter((id) => id !== group.lead.actorId),
    );
    group.otherActorCount = others.size;
  }

  return groups;
}
