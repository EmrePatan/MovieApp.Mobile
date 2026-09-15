import { buildNotificationRoute } from '@/features/notifications/utils/notification-navigation';

describe('buildNotificationRoute', () => {
  it('builds movie detail routes', () => {
    expect(buildNotificationRoute('movie', '3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe(
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
  });

  it('builds tv detail routes', () => {
    expect(buildNotificationRoute('tv', '7c9e6679-7425-40de-944b-e07fc1f90ae7')).toBe(
      '/tv/7c9e6679-7425-40de-944b-e07fc1f90ae7',
    );
  });
});
