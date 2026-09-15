import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllNotificationsRead } from '../api/notifications-api';
import {
  notificationsInboxInfiniteQueryKey,
  unreadNotificationCountQueryKey,
} from './notification-query-keys';
import {
  clearUnreadNotificationCountInCache,
  markAllNotificationsReadInCache,
} from '../utils/notification-cache-updates';
import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from '../types';

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      const inboxQueryKey = notificationsInboxInfiniteQueryKey(DEFAULT_NOTIFICATIONS_PAGE_SIZE);
      const unreadQueryKey = unreadNotificationCountQueryKey();

      await queryClient.cancelQueries({ queryKey: inboxQueryKey });
      await queryClient.cancelQueries({ queryKey: unreadQueryKey });

      const readAtUtc = new Date().toISOString();
      const previousInbox = markAllNotificationsReadInCache(queryClient, readAtUtc);
      const previousUnread = clearUnreadNotificationCountInCache(queryClient);

      return { previousInbox, previousUnread, inboxQueryKey, unreadQueryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousInbox) {
        queryClient.setQueryData(context.inboxQueryKey, context.previousInbox);
      }

      if (context?.previousUnread) {
        queryClient.setQueryData(context.unreadQueryKey, context.previousUnread);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
