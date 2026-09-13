import {
  isHorizontalRatingIntent,
  isVerticalScrollIntent,
  resolveRatingGestureMode,
  shouldCommitRatingGesture,
} from '@/features/ratings/utils/star-rating-gesture';

describe('star-rating-gesture', () => {
  it('detects horizontal rating intent', () => {
    expect(isHorizontalRatingIntent(8, 2)).toBe(true);
    expect(isHorizontalRatingIntent(2, 8)).toBe(false);
  });

  it('detects vertical scroll intent', () => {
    expect(isVerticalScrollIntent(2, 10)).toBe(true);
    expect(isVerticalScrollIntent(10, 2)).toBe(false);
  });

  it('resolves pending gestures to rating for horizontal movement', () => {
    expect(resolveRatingGestureMode('pending', 12, 2)).toBe('rating');
  });

  it('resolves pending gestures to vertical for vertical movement', () => {
    expect(resolveRatingGestureMode('pending', 2, 12)).toBe('vertical');
  });

  it('keeps rating mode locked during horizontal drags', () => {
    expect(resolveRatingGestureMode('rating', 2, 12)).toBe('rating');
  });

  it('commits taps and horizontal drags but not vertical scroll attempts', () => {
    expect(shouldCommitRatingGesture('pending')).toBe(true);
    expect(shouldCommitRatingGesture('rating')).toBe(true);
    expect(shouldCommitRatingGesture('vertical')).toBe(false);
  });
});
