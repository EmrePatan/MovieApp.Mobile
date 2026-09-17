import {
  formatEstimatedDuration,
  getWatchingMixPercentages,
  normalizeActivityDayState,
} from '@/features/insights/utils/insights-format';

describe('insights format helpers', () => {
  it('formats estimated duration in hours and days', () => {
    expect(formatEstimatedDuration(45)).toBe('45m');
    expect(formatEstimatedDuration(755)).toBe('12h 35m');
    expect(formatEstimatedDuration(4800)).toBe('3d 8h');
  });

  it('normalizes activity day states', () => {
    expect(normalizeActivityDayState('BeforeJoin')).toBe('beforeJoin');
    expect(normalizeActivityDayState('NoActivity')).toBe('noActivity');
    expect(normalizeActivityDayState('Active')).toBe('active');
    expect(normalizeActivityDayState(2)).toBe('beforeJoin');
  });

  it('calculates watching mix percentages from title counts', () => {
    expect(getWatchingMixPercentages(28, 9)).toEqual({ moviePercent: 76, seriesPercent: 24 });
    expect(getWatchingMixPercentages(0, 0)).toEqual({ moviePercent: 0, seriesPercent: 0 });
  });
});
