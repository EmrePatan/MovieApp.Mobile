import {
  currentProfileQueryKey,
  profileStatisticsQueryKey,
} from '@/features/profile/hooks/profile-query-keys';

describe('profile query keys', () => {
  it('uses profile query keys', () => {
    expect(currentProfileQueryKey()).toEqual(['profile', 'me']);
    expect(profileStatisticsQueryKey()).toEqual(['profile', 'statistics']);
  });
});
