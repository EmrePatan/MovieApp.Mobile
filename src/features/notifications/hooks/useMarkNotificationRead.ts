import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationRead } from '../api/notifications-api';
import {
  notificationsInboxInfiniteQueryKey,
  unreadNotificationCountQueryKey,
} from './notification-query-keys';
import {
  decrementUnreadNotificationCountInCache,
  markNotificationReadInCache,
} from '../utils/notification-cache-updates';
import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from '../types';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onMutate: async (notificationId) => {
      const inboxQueryKey = notificationsInboxInfiniteQueryKey(DEFAULT_NOTIFICATIONS_PAGE_SIZE);
      const unreadQueryKey = unreadNotificationCountQueryKey();

      await queryClient.cancelQueries({ queryKey: inboxQueryKey });
      await queryClient.cancelQueries({ queryKey: unreadQueryKey });

      const readAtUtc = new Date().toISOString();
      const previousInbox = markNotificationReadInCache(
        queryClient,
        notificationId,
        readAtUtc,
      );
      const previousUnread = decrementUnreadNotificationCountInCache(queryClient);

      return { previousInbox, previousUnread, inboxQueryKey, unreadQueryKey, readAtUtc };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousInbox) {
        queryClient.setQueryData(context.inboxQueryKey, context.previousInbox);
      }

      if (context?.previousUnread) {
        queryClient.setQueryData(context.unreadQueryKey, context.previousUnread);
      }
    },
    onSuccess: (response) => {
      markNotificationReadInCache(
        queryClient,
        response.id,
        response.readAtUtc,
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
