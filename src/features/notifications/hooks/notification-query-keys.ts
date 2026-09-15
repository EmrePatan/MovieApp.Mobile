import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from '../types';

export const NOTIFICATIONS_QUERY_KEY_ROOT = ['notifications'] as const;

export function notificationsInboxInfiniteQueryKey(
  pageSize = DEFAULT_NOTIFICATIONS_PAGE_SIZE,
): readonly ['notifications', 'inbox', number] {
  return [...NOTIFICATIONS_QUERY_KEY_ROOT, 'inbox', pageSize];
}

export function unreadNotificationCountQueryKey(): readonly ['notifications', 'unread-count'] {
  return [...NOTIFICATIONS_QUERY_KEY_ROOT, 'unread-count'];
}
