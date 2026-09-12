import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';

describe('invalidate recommendation queries', () => {
  it('invalidates recommendation and home queries', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateRecommendationQueries(queryClient);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['recommendations'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['home'] });
  });
});
