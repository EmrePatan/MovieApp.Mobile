import type { ContentType, PaginatedResponse } from '@/models/api/pagination';

export type NotificationType = 'MovieReleased' | 'NewSeason' | 'NewEpisodes';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAtUtc: string;
  readAtUtc: string | null;
  contentType: ContentType;
  contentId: string;
  posterPath: string | null;
}

export type NotificationsInboxResponse = PaginatedResponse<NotificationItem>;

export interface NotificationsInboxRequest {
  page?: number;
  pageSize?: number;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}

export interface MarkNotificationReadResponse {
  id: string;
  readAtUtc: string;
  contentType: ContentType;
  contentId: string;
}

export interface MarkAllNotificationsReadResponse {
  affectedCount: number;
}

export const DEFAULT_NOTIFICATIONS_PAGE_SIZE = 20;
