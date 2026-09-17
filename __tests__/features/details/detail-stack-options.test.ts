import { ratedDetailStackScreenOptions } from '@/features/details/shared/navigation/detail-stack-options';

describe('detail-stack-options', () => {
  it('keeps edge back-swipe enabled while disabling full-screen back gestures', () => {
    expect(ratedDetailStackScreenOptions).toEqual({
      gestureEnabled: true,
      fullScreenGestureEnabled: false,
    });
  });
});
