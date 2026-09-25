import { flattenNotificationPages } from '@/features/notifications/utils/flatten-notification-pages';
import type { NotificationItem, NotificationsInboxResponse } from '@/features/notifications/types';

function createNotification(id: string): NotificationItem {
  return {
    id,
    type: 'MovieReleased',
    title: id,
    body: 'Now available',
    createdAtUtc: '2026-09-25T00:00:00Z',
    readAtUtc: null,
    contentType: 'movie',
    contentId: 'movie-1',
    posterPath: null,
  };
}

function createPage(items: NotificationItem[]): NotificationsInboxResponse {
  return {
    items,
    page: 1,
    pageSize: 20,
    totalCount: items.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

describe('flattenNotificationPages', () => {
  it('drops notifications that overlap between pages', () => {
    const items = flattenNotificationPages([
      createPage([createNotification('a'), createNotification('b')]),
      createPage([createNotification('b'), createNotification('c')]),
    ]);

    expect(items.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });
});
