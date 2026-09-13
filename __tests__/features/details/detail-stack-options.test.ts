import { ratedDetailStackScreenOptions } from '@/features/details/shared/navigation/detail-stack-options';

describe('detail-stack-options', () => {
  it('disables native swipe-back on rated detail routes', () => {
    expect(ratedDetailStackScreenOptions).toEqual({
      gestureEnabled: false,
    });
  });
});
