import {
  resolveTvShowStatusKind,
  translateTvShowStatus,
} from '@/features/details/tv/utils/tv-show-status';
import { ensureI18nInitialized, i18n } from '@/i18n';

describe('tv show status localization', () => {
  beforeEach(async () => {
    await ensureI18nInitialized('en');
  });

  it('maps returning series to localized label', async () => {
    expect(translateTvShowStatus('Returning Series', i18n.t)).toBe('Returning series');
    await i18n.changeLanguage('tr');
    expect(translateTvShowStatus('Returning Series', i18n.t)).toBe('Devam Ediyor');
  });

  it('maps ended and canceled statuses', async () => {
    expect(translateTvShowStatus('Ended', i18n.t)).toBe('Ended');
    expect(translateTvShowStatus('Canceled', i18n.t)).toBe('Canceled');
    await i18n.changeLanguage('tr');
    expect(translateTvShowStatus('Ended', i18n.t)).toBe('Sona Erdi');
    expect(translateTvShowStatus('Canceled', i18n.t)).toBe('İptal Edildi');
  });

  it('hides unknown or empty statuses', () => {
    expect(translateTvShowStatus('', i18n.t)).toBeNull();
    expect(translateTvShowStatus('   ', i18n.t)).toBeNull();
    expect(translateTvShowStatus('Rumored', i18n.t)).toBeNull();
    expect(translateTvShowStatus('Devam Ediyor', i18n.t)).toBeNull();
    expect(resolveTvShowStatusKind('Rumored')).toBeNull();
  });

  it('resolves status kind for bar theming', () => {
    expect(resolveTvShowStatusKind('Ended')).toBe('ended');
    expect(resolveTvShowStatusKind('Returning Series')).toBe('returningSeries');
  });
});
