import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNotification } from '../api/notifications-api';
import {
  notificationsInboxInfiniteQueryKey,
  unreadNotificationCountQueryKey,
} from './notification-query-keys';
import {
  decrementUnreadNotificationCountInCache,
  deleteNotificationFromCache,
} from '../utils/notification-cache-updates';
import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from '../types';

interface DeleteNotificationVariables {
  notificationId: string;
  wasUnread: boolean;
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId }: DeleteNotificationVariables) =>
      deleteNotification(notificationId),
    onMutate: async ({ notificationId, wasUnread }) => {
      const inboxQueryKey = notificationsInboxInfiniteQueryKey(DEFAULT_NOTIFICATIONS_PAGE_SIZE);
      const unreadQueryKey = unreadNotificationCountQueryKey();

      await queryClient.cancelQueries({ queryKey: inboxQueryKey });
      await queryClient.cancelQueries({ queryKey: unreadQueryKey });

      const previousInbox = deleteNotificationFromCache(queryClient, notificationId);
      const previousUnread = wasUnread
        ? decrementUnreadNotificationCountInCache(queryClient)
        : undefined;

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
