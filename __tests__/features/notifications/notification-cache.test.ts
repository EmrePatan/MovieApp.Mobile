import { QueryClient } from '@tanstack/react-query';
import {
  notificationsInboxInfiniteQueryKey,
  unreadNotificationCountQueryKey,
} from '@/features/notifications/hooks/notification-query-keys';
import {
  clearUnreadNotificationCountInCache,
  decrementUnreadNotificationCountInCache,
  deleteNotificationFromCache,
  markAllNotificationsReadInCache,
  markNotificationReadInCache,
} from '@/features/notifications/utils/notification-cache-updates';
import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from '@/features/notifications/types';

const notificationId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const readAtUtc = '2026-09-14T19:00:00Z';

function seedInbox(queryClient: QueryClient) {
  const queryKey = notificationsInboxInfiniteQueryKey(DEFAULT_NOTIFICATIONS_PAGE_SIZE);

  queryClient.setQueryData(queryKey, {
    pages: [
      {
        items: [
          {
            id: notificationId,
            type: 'MovieReleased',
            title: 'Dune: Part Three',
            body: 'Now available',
            createdAtUtc: '2026-09-14T18:30:00Z',
            readAtUtc: null,
            contentType: 'movie',
            contentId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
            posterPath: null,
          },
        ],
        page: 1,
        pageSize: 20,
        totalCount: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    ],
    pageParams: [1],
  });
}

describe('notification cache updates', () => {
  it('marks a single notification read in the inbox cache', () => {
    const queryClient = new QueryClient();
    const queryKey = notificationsInboxInfiniteQueryKey(DEFAULT_NOTIFICATIONS_PAGE_SIZE);
    seedInbox(queryClient);

    markNotificationReadInCache(queryClient, notificationId, readAtUtc);
    const next = queryClient.getQueryData<ReturnType<typeof seedInbox>>(queryKey);

    expect(next?.pages[0]?.items[0]?.readAtUtc).toBe(readAtUtc);
  });

  it('marks all notifications read in the inbox cache', () => {
    const queryClient = new QueryClient();
    const queryKey = notificationsInboxInfiniteQueryKey(DEFAULT_NOTIFICATIONS_PAGE_SIZE);
    seedInbox(queryClient);

    markAllNotificationsReadInCache(queryClient, readAtUtc);
    const next = queryClient.getQueryData<ReturnType<typeof seedInbox>>(queryKey);

    expect(next?.pages[0]?.items[0]?.readAtUtc).toBe(readAtUtc);
  });

  it('decrements unread count in cache', () => {
    const queryClient = new QueryClient();
    const queryKey = unreadNotificationCountQueryKey();
    queryClient.setQueryData(queryKey, { unreadCount: 3 });

    decrementUnreadNotificationCountInCache(queryClient);
    const next = queryClient.getQueryData<{ unreadCount: number }>(queryKey);

    expect(next?.unreadCount).toBe(2);
  });

  it('clears unread count in cache', () => {
    const queryClient = new QueryClient();
    const queryKey = unreadNotificationCountQueryKey();
    queryClient.setQueryData(queryKey, { unreadCount: 5 });

    clearUnreadNotificationCountInCache(queryClient);
    const next = queryClient.getQueryData<{ unreadCount: number }>(queryKey);

    expect(next?.unreadCount).toBe(0);
  });

  it('removes a notification from the inbox cache', () => {
    const queryClient = new QueryClient();
    const queryKey = notificationsInboxInfiniteQueryKey(DEFAULT_NOTIFICATIONS_PAGE_SIZE);
    seedInbox(queryClient);

    const previous = deleteNotificationFromCache(queryClient, notificationId);
    const next = queryClient.getQueryData<ReturnType<typeof seedInbox>>(queryKey);

    expect(previous?.pages[0]?.items).toHaveLength(1);
    expect(next?.pages[0]?.items).toHaveLength(0);
    expect(next?.pages[0]?.totalCount).toBe(0);
  });

  it('restores inbox cache on rollback after optimistic delete', () => {
    const queryClient = new QueryClient();
    const queryKey = notificationsInboxInfiniteQueryKey(DEFAULT_NOTIFICATIONS_PAGE_SIZE);
    seedInbox(queryClient);

    const previous = deleteNotificationFromCache(queryClient, notificationId);
    queryClient.setQueryData(queryKey, previous);

    const restored = queryClient.getQueryData<ReturnType<typeof seedInbox>>(queryKey);
    expect(restored?.pages[0]?.items).toHaveLength(1);
    expect(restored?.pages[0]?.items[0]?.id).toBe(notificationId);
  });

  it('only decrements unread count for unread deletions', () => {
    const queryClient = new QueryClient();
    const unreadQueryKey = unreadNotificationCountQueryKey();
    queryClient.setQueryData(unreadQueryKey, { unreadCount: 2 });

    decrementUnreadNotificationCountInCache(queryClient);
    const next = queryClient.getQueryData<{ unreadCount: number }>(unreadQueryKey);

    expect(next?.unreadCount).toBe(1);
  });
});
