import { currentProfileQueryKey } from '@/features/profile/hooks/profile-query-keys';

describe('profile avatar cache keys', () => {
  it('uses stable profile query key', () => {
    expect(currentProfileQueryKey()).toEqual(['profile', 'me']);
  });
});
