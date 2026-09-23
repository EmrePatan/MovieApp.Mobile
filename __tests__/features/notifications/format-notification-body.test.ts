import { initI18nForTests, t } from '../../i18n/i18n-test-utils';
import { formatNotificationBody } from '@/features/notifications/utils/format-notification-body';
import type { NotificationItem } from '@/features/notifications/types';

const baseItem: NotificationItem = {
  id: '1',
  type: 'MovieReleased',
  title: 'Possible Love',
  body: 'Now available',
  createdAtUtc: '2026-09-23T00:00:00Z',
  readAtUtc: null,
  contentType: 'movie',
  contentId: 'movie-1',
  posterPath: null,
};

describe('formatNotificationBody', () => {
  beforeEach(async () => {
    await initI18nForTests('en');
  });

  it('localizes movie release body in Spanish', async () => {
    await initI18nForTests('es');

    expect(formatNotificationBody(baseItem, t)).toBe('Ya disponible');
  });

  it('localizes movie release body in Turkish', async () => {
    await initI18nForTests('tr');

    expect(formatNotificationBody(baseItem, t)).toBe('Şimdi yayında');
  });

  it('localizes plural episode notifications', async () => {
    await initI18nForTests('es');

    expect(
      formatNotificationBody(
        {
          ...baseItem,
          type: 'NewEpisodes',
          body: '3 new episodes',
        },
        t,
      ),
    ).toBe('3 episodios nuevos');
  });
});
