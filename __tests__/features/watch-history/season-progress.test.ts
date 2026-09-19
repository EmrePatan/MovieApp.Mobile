import {
  calculateSeasonProgressPercentage,
  formatSeasonProgressCount,
  formatTvShowWatchedSummary,
  getSeasonProgressState,
  normalizeProgressCounts,
} from '@/features/watch-history/utils/season-progress';

describe('season progress utilities', () => {
  it('normalizes stale watched counts above total', () => {
    expect(normalizeProgressCounts(30, 22)).toEqual({
      watchedEpisodes: 22,
      totalEpisodes: 22,
    });
  });

  it('returns not-started for zero watched episodes', () => {
    expect(getSeasonProgressState(0, 22)).toBe('not-started');
    expect(formatSeasonProgressCount(0, 22)).toBe('0 / 22');
  });

  it('returns in-progress for partial seasons', () => {
    expect(getSeasonProgressState(8, 22)).toBe('in-progress');
    expect(calculateSeasonProgressPercentage(8, 22)).toBeCloseTo(36.36, 1);
  });

  it('returns completed for fully watched seasons', () => {
    expect(getSeasonProgressState(22, 22)).toBe('completed');
    expect(formatSeasonProgressCount(22, 22)).toBe('22 / 22');
    expect(calculateSeasonProgressPercentage(22, 22)).toBe(100);
  });

  it('clamps percentages and handles zero totals safely', () => {
    expect(calculateSeasonProgressPercentage(0, 0)).toBe(0);
    expect(calculateSeasonProgressPercentage(12, 0)).toBe(0);
    expect(calculateSeasonProgressPercentage(140, 22)).toBe(100);
    expect(formatTvShowWatchedSummary(34, 208)).toBe('34 of 208 episodes');
    expect(formatTvShowWatchedSummary(0, 0)).toBeNull();
  });
});
