import type { NotificationItem, NotificationsInboxResponse } from '../types';

export function flattenNotificationPages(
  pages: NotificationsInboxResponse[],
): NotificationItem[] {
  const seen = new Set<string>();
  const items: NotificationItem[] = [];

  for (const page of pages) {
    for (const item of page.items) {
      if (seen.has(item.id)) {
        continue;
      }

      seen.add(item.id);
      items.push(item);
    }
  }

  return items;
}
