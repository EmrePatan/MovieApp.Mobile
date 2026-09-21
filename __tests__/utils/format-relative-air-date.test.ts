import { formatRelativeAirDateLocalized } from '@/utils/format-relative-air-date';
import { initI18nForTests, t } from '../i18n/i18n-test-utils';

describe('formatRelativeAirDateLocalized', () => {
  beforeAll(async () => {
    await initI18nForTests('en');
  });

  it('localizes today and tomorrow', () => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const tomorrowIso = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    expect(formatRelativeAirDateLocalized(tomorrowIso, t)).toBe('Tomorrow');
  });
});

describe('formatRelativeAirDateLocalized (Turkish)', () => {
  beforeAll(async () => {
    await initI18nForTests('tr');
  });

  it('localizes relative dates in Turkish', () => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const tomorrowIso = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    expect(formatRelativeAirDateLocalized(tomorrowIso, t)).toBe('Yarın');
  });
});
