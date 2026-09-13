import {
  isShowFullyWatched,
  shouldTriggerShowCompletionCelebration,
} from '@/features/watch-history/utils/show-completion-celebration';

describe('show completion celebration', () => {
  it('triggers only when crossing from incomplete to complete', () => {
    expect(shouldTriggerShowCompletionCelebration(null, 35, 35)).toBe(false);
    expect(shouldTriggerShowCompletionCelebration(34, 35, 35)).toBe(true);
    expect(shouldTriggerShowCompletionCelebration(35, 35, 35)).toBe(false);
    expect(shouldTriggerShowCompletionCelebration(10, 20, 35)).toBe(false);
    expect(shouldTriggerShowCompletionCelebration(34, 35, 0)).toBe(false);
  });

  it('detects a fully watched show', () => {
    expect(isShowFullyWatched(35, 35)).toBe(true);
    expect(isShowFullyWatched(34, 35)).toBe(false);
    expect(isShowFullyWatched(0, 0)).toBe(false);
  });
});
