import type { TFunction } from 'i18next';
import type { NotificationItem, NotificationType } from '../types';

function parseEventCount(body: string): number {
  const match = /^(\d+)\b/.exec(body.trim());
  if (!match) {
    return 1;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getBodyKey(type: NotificationType, count: number): string {
  const suffix = count === 1 ? 'one' : 'other';

  switch (type) {
    case 'MovieReleased':
      return `notifications.body.movieReleased_${suffix}`;
    case 'NewEpisodes':
      return `notifications.body.newEpisodes_${suffix}`;
    case 'NewSeason':
      return `notifications.body.newSeason_${suffix}`;
    default:
      return 'notifications.body.fallback';
  }
}

export function formatNotificationBody(item: NotificationItem, t: TFunction): string {
  const count = parseEventCount(item.body);
  const key = getBodyKey(item.type, count);

  if (!t(key, { defaultValue: '' })) {
    return item.body;
  }

  return t(key, { count });
}
