import {
  formatMonthLabel,
  getGenrePercentage,
  getPreviousMonthComparison,
  getTotalWatchedCount,
  getWatchingMixPercentages,
} from '@/features/profile/utils/profile-analytics';
import { createProfileStatisticsFixture } from '@/features/profile/utils/profile-statistics-fixtures';

describe('profile-analytics', () => {
  it('calculates watched total and genre percentage', () => {
    const statistics = createProfileStatisticsFixture();

    expect(getTotalWatchedCount(statistics)).toBe(60);
    expect(getGenrePercentage(10, 17)).toBe(59);
  });

  it('calculates month-over-month comparison', () => {
    const statistics = createProfileStatisticsFixture();

    expect(getPreviousMonthComparison(statistics.activity)).toBe(-33);
    expect(formatMonthLabel(4, 2026)).toBe('Apr');
  });

  it('calculates watching mix percentages', () => {
    const statistics = createProfileStatisticsFixture();

    expect(getWatchingMixPercentages(statistics)).toEqual({
      moviePercent: 75,
      tvPercent: 25,
    });
  });
});
