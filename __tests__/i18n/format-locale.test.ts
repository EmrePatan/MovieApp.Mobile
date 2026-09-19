import { changeUiLanguage } from '@/i18n';
import { formatIsoDate, formatVoteCount } from '@/utils/format';

describe('shared formatting locale', () => {
  beforeEach(async () => {
    await changeUiLanguage('en');
  });

  it('formats dates using en-US when UI language is English', async () => {
    const formatted = formatIsoDate('2024-03-15');

    expect(formatted).toMatch(/Mar/);
    expect(formatted).toMatch(/15/);
    expect(formatted).toMatch(/2024/);
  });

  it('formats dates using tr-TR when UI language is Turkish', async () => {
    await changeUiLanguage('tr');

    const formatted = formatIsoDate('2024-03-15');

    expect(formatted).toMatch(/Mar|Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara/i);
    expect(formatted).toMatch(/2024/);
  });

  it('formats vote counts with locale grouping', async () => {
    await changeUiLanguage('tr');

    expect(formatVoteCount(12500)).toBe(
      (12500).toLocaleString('tr-TR'),
    );
  });
});
