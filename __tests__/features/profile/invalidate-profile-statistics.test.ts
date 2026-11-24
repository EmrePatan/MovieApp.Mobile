import { QueryClient } from '@tanstack/react-query';
import { invalidateProfileStatistics } from '@/features/profile/utils/invalidate-profile-statistics';

describe('invalidateProfileStatistics', () => {
  it('refreshes the insights tab together with profile statistics', () => {
    const queryClient = new QueryClient();
    const spy = jest.spyOn(queryClient, 'invalidateQueries');

    invalidateProfileStatistics(queryClient);

    const keys = spy.mock.calls.map(([filters]) => filters?.queryKey);
    expect(keys).toContainEqual(['insights']);
    expect(keys).toHaveLength(2);
  });
});
