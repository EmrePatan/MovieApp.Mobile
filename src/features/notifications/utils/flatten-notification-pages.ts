import type { NotificationItem, NotificationsInboxResponse } from '../types';

export function flattenNotificationPages(
  pages: NotificationsInboxResponse[],
): NotificationItem[] {
  return pages.flatMap((page) => page.items);
}
