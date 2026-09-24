import { shouldTriggerShowCompletionCelebration } from '@/features/watch-history/utils/show-completion-celebration';

describe('show completion celebration', () => {
  it('triggers only when the server-decided completion flips from false to true', () => {
    expect(shouldTriggerShowCompletionCelebration(null, true)).toBe(false);
    expect(shouldTriggerShowCompletionCelebration(false, true)).toBe(true);
    expect(shouldTriggerShowCompletionCelebration(true, true)).toBe(false);
    expect(shouldTriggerShowCompletionCelebration(false, false)).toBe(false);
    expect(shouldTriggerShowCompletionCelebration(true, false)).toBe(false);
  });
});
