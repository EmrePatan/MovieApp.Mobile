import { validateAiRecommendationMessage } from '@/features/ai-recommendations/utils/validate-ai-message';

describe('validateAiRecommendationMessage', () => {
  it('rejects prompts shorter than three characters', () => {
    expect(validateAiRecommendationMessage('  a ')).toBe(
      'Describe what you want in at least 3 characters.',
    );
  });

  it('accepts valid prompts', () => {
    expect(validateAiRecommendationMessage('cozy mystery tonight')).toBeNull();
  });
});
