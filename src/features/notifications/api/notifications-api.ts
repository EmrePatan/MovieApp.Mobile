import { api } from '@/api/client';
import {
  buildDeleteNotificationPath,
  buildMarkAllNotificationsReadPath,
  buildMarkNotificationReadPath,
  buildNotificationsInboxPath,
  buildUnreadNotificationCountPath,
} from './routes';
import type {
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  NotificationsInboxRequest,
  NotificationsInboxResponse,
  UnreadNotificationCountResponse,
} from '../types';

export async function getNotificationsInbox(
  criteria: NotificationsInboxRequest = {},
  signal?: AbortSignal,
): Promise<NotificationsInboxResponse> {
  return api.get<NotificationsInboxResponse>(buildNotificationsInboxPath(criteria), { signal });
}

export async function getUnreadNotificationCount(
  signal?: AbortSignal,
): Promise<UnreadNotificationCountResponse> {
  return api.get<UnreadNotificationCountResponse>(buildUnreadNotificationCountPath(), { signal });
}

export async function markNotificationRead(
  notificationId: string,
  signal?: AbortSignal,
): Promise<MarkNotificationReadResponse> {
  return api.patch<MarkNotificationReadResponse>(
    buildMarkNotificationReadPath(notificationId),
    undefined,
    { signal },
  );
}

export async function markAllNotificationsRead(
  signal?: AbortSignal,
): Promise<MarkAllNotificationsReadResponse> {
  return api.patch<MarkAllNotificationsReadResponse>(
    buildMarkAllNotificationsReadPath(),
    undefined,
    { signal },
  );
}

export async function deleteNotification(
  notificationId: string,
  signal?: AbortSignal,
): Promise<void> {
  await api.delete(buildDeleteNotificationPath(notificationId), { signal });
}
