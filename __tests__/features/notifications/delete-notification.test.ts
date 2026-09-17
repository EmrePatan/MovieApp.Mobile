import { deleteNotification } from '@/features/notifications/api/notifications-api';
import { buildDeleteNotificationPath } from '@/features/notifications/api/routes';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    delete: jest.fn(),
  },
}));

describe('delete notification api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the delete endpoint with the notification id', async () => {
    (api.delete as jest.Mock).mockResolvedValue(undefined);
    const notificationId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    await deleteNotification(notificationId);

    expect(api.delete).toHaveBeenCalledWith(buildDeleteNotificationPath(notificationId), {
      signal: undefined,
    });
  });
});
