import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import {
  notificationsInboxInfiniteQueryKey,
  unreadNotificationCountQueryKey,
} from '../hooks/notification-query-keys';
import type {
  NotificationsInboxResponse,
  UnreadNotificationCountResponse,
} from '../types';
import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from '../types';

function getInboxQueryKey(pageSize = DEFAULT_NOTIFICATIONS_PAGE_SIZE) {
  return notificationsInboxInfiniteQueryKey(pageSize);
}

export function markNotificationReadInCache(
  queryClient: QueryClient,
  notificationId: string,
  readAtUtc: string,
  pageSize = DEFAULT_NOTIFICATIONS_PAGE_SIZE,
): InfiniteData<NotificationsInboxResponse> | undefined {
  const queryKey = getInboxQueryKey(pageSize);
  const previous = queryClient.getQueryData<InfiniteData<NotificationsInboxResponse>>(queryKey);

  if (!previous) {
    return undefined;
  }

  queryClient.setQueryData<InfiniteData<NotificationsInboxResponse>>(queryKey, {
    ...previous,
    pages: previous.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.id === notificationId ? { ...item, readAtUtc } : item,
      ),
    })),
  });

  return previous;
}

export function markAllNotificationsReadInCache(
  queryClient: QueryClient,
  readAtUtc: string,
  pageSize = DEFAULT_NOTIFICATIONS_PAGE_SIZE,
): InfiniteData<NotificationsInboxResponse> | undefined {
  const queryKey = getInboxQueryKey(pageSize);
  const previous = queryClient.getQueryData<InfiniteData<NotificationsInboxResponse>>(queryKey);

  if (!previous) {
    return undefined;
  }

  queryClient.setQueryData<InfiniteData<NotificationsInboxResponse>>(queryKey, {
    ...previous,
    pages: previous.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.readAtUtc ? item : { ...item, readAtUtc },
      ),
    })),
  });

  return previous;
}

export function setUnreadNotificationCountInCache(
  queryClient: QueryClient,
  unreadCount: number,
): UnreadNotificationCountResponse | undefined {
  const queryKey = unreadNotificationCountQueryKey();
  const previous = queryClient.getQueryData<UnreadNotificationCountResponse>(queryKey);

  queryClient.setQueryData<UnreadNotificationCountResponse>(queryKey, { unreadCount });

  return previous;
}

export function decrementUnreadNotificationCountInCache(
  queryClient: QueryClient,
): UnreadNotificationCountResponse | undefined {
  const queryKey = unreadNotificationCountQueryKey();
  const previous = queryClient.getQueryData<UnreadNotificationCountResponse>(queryKey);

  if (!previous) {
    return undefined;
  }

  const unreadCount = Math.max(0, previous.unreadCount - 1);
  queryClient.setQueryData<UnreadNotificationCountResponse>(queryKey, { unreadCount });

  return previous;
}

export function clearUnreadNotificationCountInCache(
  queryClient: QueryClient,
): UnreadNotificationCountResponse | undefined {
  return setUnreadNotificationCountInCache(queryClient, 0);
}
