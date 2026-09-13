import {
  clampProgressPercentage,
  formatNextEpisodeLine,
  formatProgressPercentDisplay,
  formatProgressPercentage,
  formatWatchProgressEpisodeSummary,
  formatWatchProgressLabel,
  getWatchProgressCompletionLabel,
} from '@/features/watch-history/utils/progress-format';

describe('watch progress formatting', () => {
  it('formats watched episode counts for detail UI', () => {
    expect(formatWatchProgressEpisodeSummary(0, 22)).toBe('0 of 22 episodes');
    expect(formatWatchProgressEpisodeSummary(12, 24)).toBe('12 of 24 episodes');
    expect(formatWatchProgressEpisodeSummary(1, 1)).toBe('1 of 1 episode');
  });

  it('formats progress percentage for detail UI', () => {
    expect(formatProgressPercentDisplay(50.4)).toBe('50%');
    expect(formatProgressPercentDisplay(0)).toBe('0%');
    expect(formatProgressPercentDisplay(100)).toBe('100%');
  });

  it('clamps progress percentages safely', () => {
    expect(clampProgressPercentage(-12)).toBe(0);
    expect(clampProgressPercentage(0)).toBe(0);
    expect(clampProgressPercentage(42.8)).toBe(42.8);
    expect(clampProgressPercentage(140)).toBe(100);
    expect(clampProgressPercentage(Number.NaN)).toBe(0);
  });

  it('formats next episode lines', () => {
    expect(
      formatNextEpisodeLine({
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Pilot',
      }),
    ).toBe('S1 E1 · Pilot');

    expect(
      formatNextEpisodeLine({
        episodeNumber: 5,
        title: 'Gray Matter',
      }, false),
    ).toBe('E5 · Gray Matter');
  });

  it('returns a completed label only when there is no next episode', () => {
    expect(getWatchProgressCompletionLabel(22, 22, false)).toBe('All episodes watched');
    expect(getWatchProgressCompletionLabel(10, 22, true)).toBeNull();
    expect(getWatchProgressCompletionLabel(0, 22, false)).toBeNull();
  });

  it('keeps legacy formatting helpers for existing callers', () => {
    expect(formatWatchProgressLabel(12, 24)).toBe('12 / 24 episodes watched');
    expect(formatProgressPercentage(50.4)).toBe('50% complete');
  });
});
