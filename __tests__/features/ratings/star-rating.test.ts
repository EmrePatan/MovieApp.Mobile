import {
  backendScoreToStarRating,
  formatCommunityRatingCountLabel,
  formatCommunityStarRatingDisplay,
  formatStarRatingAccessibilityValue,
  getStarFillState,
  isValidBackendScore,
  getRatingStarClusterWidth,
  getRatingTouchTrackWidth,
  positionToStarRating,
  resolveRatingGesturePosition,
  starRatingToBackendScore,
  stepStarRating,
} from '@/features/ratings/utils/star-rating';

const TRACK_WIDTH = 200;
const STAR_CLUSTER_WIDTH = getRatingStarClusterWidth();
const TOUCH_TRACK_WIDTH = getRatingTouchTrackWidth();

describe('star-rating conversions', () => {
  it('maps backend scores to star ratings', () => {
    expect(backendScoreToStarRating(1)).toBe(0.5);
    expect(backendScoreToStarRating(2)).toBe(1);
    expect(backendScoreToStarRating(3)).toBe(1.5);
    expect(backendScoreToStarRating(5)).toBe(2.5);
    expect(backendScoreToStarRating(7)).toBe(3.5);
    expect(backendScoreToStarRating(8)).toBe(4);
    expect(backendScoreToStarRating(9)).toBe(4.5);
    expect(backendScoreToStarRating(10)).toBe(5);
  });

  it('maps star ratings to backend scores', () => {
    expect(starRatingToBackendScore(0.5)).toBe(1);
    expect(starRatingToBackendScore(1)).toBe(2);
    expect(starRatingToBackendScore(1.5)).toBe(3);
    expect(starRatingToBackendScore(2.5)).toBe(5);
    expect(starRatingToBackendScore(3.5)).toBe(7);
    expect(starRatingToBackendScore(4)).toBe(8);
    expect(starRatingToBackendScore(4.5)).toBe(9);
    expect(starRatingToBackendScore(5)).toBe(10);
  });

  it('clamps invalid UI values to backend range 1-10', () => {
    expect(starRatingToBackendScore(0)).toBe(1);
    expect(starRatingToBackendScore(6)).toBe(10);
    expect(isValidBackendScore(starRatingToBackendScore(4.5))).toBe(true);
    expect(isValidBackendScore(0)).toBe(false);
    expect(isValidBackendScore(11)).toBe(false);
  });

  it('derives star fill states for half and full stars', () => {
    expect(getStarFillState(1, 0)).toBe('empty');
    expect(getStarFillState(1, 0.5)).toBe('half');
    expect(getStarFillState(1, 1)).toBe('full');
    expect(getStarFillState(4, 3.5)).toBe('half');
    expect(getStarFillState(5, 5)).toBe('full');
  });

  it('formats community averages on the 5-star scale with one decimal', () => {
    expect(formatCommunityStarRatingDisplay(4.5)).toBe('2.2');
    expect(formatCommunityStarRatingDisplay(7.5)).toBe('3.7');
    expect(formatCommunityStarRatingDisplay(8)).toBe('4.0');
  });

  it('formats community rating counts with singular and plural labels', () => {
    expect(formatCommunityRatingCountLabel(1)).toBe('1 rating');
    expect(formatCommunityRatingCountLabel(42)).toBe('42 ratings');
  });

  it('formats accessibility values on the 5-star scale', () => {
    expect(formatStarRatingAccessibilityValue(null)).toBe('Not rated');
    expect(formatStarRatingAccessibilityValue(3.5)).toBe('3.5 / 5');
  });

  it('steps ratings in 0.5 increments for accessibility', () => {
    expect(stepStarRating(3, 0.5)).toBe(3.5);
    expect(stepStarRating(3, -0.5)).toBe(2.5);
    expect(stepStarRating(0.5, -0.5)).toBe(0.5);
    expect(stepStarRating(5, 0.5)).toBe(5);
  });
});

describe('positionToStarRating', () => {
  it('maps the beginning of the track to 0.5 stars', () => {
    expect(positionToStarRating(0, TRACK_WIDTH)).toBe(0.5);
  });

  it('maps approximately 20% to about 1.0 stars', () => {
    expect(positionToStarRating(TRACK_WIDTH * 0.1, TRACK_WIDTH)).toBe(1);
  });

  it('maps the midpoint to a half-step near the center', () => {
    expect(positionToStarRating(TRACK_WIDTH * 0.5, TRACK_WIDTH)).toBe(3);
  });

  it('maps the end of the track to 5.0 stars', () => {
    expect(positionToStarRating(TRACK_WIDTH, TRACK_WIDTH)).toBe(5);
  });

  it('clamps below bounds to 0.5', () => {
    expect(positionToStarRating(-20, TRACK_WIDTH)).toBe(0.5);
  });

  it('clamps above bounds to 5.0', () => {
    expect(positionToStarRating(TRACK_WIDTH + 50, TRACK_WIDTH)).toBe(5);
  });

  it('maps left half of star 4 to 3.5 stars', () => {
    expect(positionToStarRating(TRACK_WIDTH * 0.65, TRACK_WIDTH)).toBe(3.5);
  });

  it('maps right half of star 4 to 4.0 stars', () => {
    expect(positionToStarRating(TRACK_WIDTH * 0.75, TRACK_WIDTH)).toBe(4);
  });

  it('maps the far-left edge to clear and the inner left padding to 0.5 stars', () => {
    expect(resolveRatingGesturePosition(0, TOUCH_TRACK_WIDTH, STAR_CLUSTER_WIDTH)).toBe('clear');
    expect(resolveRatingGesturePosition(3, TOUCH_TRACK_WIDTH, STAR_CLUSTER_WIDTH)).toBe('clear');
    expect(resolveRatingGesturePosition(6, TOUCH_TRACK_WIDTH, STAR_CLUSTER_WIDTH)).toBe(0.5);
    expect(resolveRatingGesturePosition(24, TOUCH_TRACK_WIDTH, STAR_CLUSTER_WIDTH)).toBe(0.5);
  });

  it('maps touches in the right padding after the stars to the maximum rating', () => {
    expect(positionToStarRating(TOUCH_TRACK_WIDTH, TOUCH_TRACK_WIDTH, STAR_CLUSTER_WIDTH)).toBe(5);
    expect(positionToStarRating(225, TOUCH_TRACK_WIDTH, STAR_CLUSTER_WIDTH)).toBe(5);
  });

  it('snaps the right side of the fifth star to a full rating', () => {
    expect(resolveRatingGesturePosition(176, TOUCH_TRACK_WIDTH, STAR_CLUSTER_WIDTH)).toBe(5);
    expect(resolveRatingGesturePosition(188, TOUCH_TRACK_WIDTH, STAR_CLUSTER_WIDTH)).toBe(5);
  });
});
