import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from '../types';
import type { NotificationsInboxRequest } from '../types';

export function buildNotificationsInboxPath(
  criteria: NotificationsInboxRequest = {},
): string {
  const params = new URLSearchParams({
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_NOTIFICATIONS_PAGE_SIZE),
  });

  return `/api/notifications?${params.toString()}`;
}

export function buildUnreadNotificationCountPath(): string {
  return '/api/notifications/unread-count';
}

export function buildMarkNotificationReadPath(notificationId: string): string {
  return `/api/notifications/${encodeURIComponent(notificationId)}/read`;
}

export function buildMarkAllNotificationsReadPath(): string {
  return '/api/notifications/read-all';
}

export function buildDeleteNotificationPath(notificationId: string): string {
  return `/api/notifications/${encodeURIComponent(notificationId)}`;
}
