import {
  formatProgressPercentage,
  formatWatchProgressLabel,
} from '@/features/watch-history/utils/progress-format';

describe('watch progress formatting', () => {
  it('formats watched episode counts', () => {
    expect(formatWatchProgressLabel(12, 24)).toBe('12 / 24 episodes watched');
  });

  it('formats progress percentage', () => {
    expect(formatProgressPercentage(50.4)).toBe('50% complete');
  });
});
