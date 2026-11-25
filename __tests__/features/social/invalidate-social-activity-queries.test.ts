import type { QueryClient } from '@tanstack/react-query';
import { invalidateSocialActivityQueries } from '@/features/social/utils/invalidate-social-activity-queries';

describe('invalidateSocialActivityQueries', () => {
  it('refreshes the feed and profile activity projections only', () => {
    const queryClient = {
      invalidateQueries: jest.fn(),
    } as unknown as QueryClient;

    invalidateSocialActivityQueries(queryClient);

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2);
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: ['social', 'feed'],
    });
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ['social', 'profile-activities'],
    });
  });
});
