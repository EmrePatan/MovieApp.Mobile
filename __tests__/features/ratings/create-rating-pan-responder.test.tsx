import { createRatingPanResponder } from '@/features/ratings/utils/create-rating-pan-responder';
import {
  getRatingStarClusterWidth,
  getRatingTouchTrackWidth,
} from '@/features/ratings/utils/star-rating';

const TRACK_WIDTH = 200;
const STAR_CLUSTER_WIDTH = getRatingStarClusterWidth();
const TOUCH_TRACK_WIDTH = getRatingTouchTrackWidth();

function createResponder(
  overrides: Partial<Parameters<typeof createRatingPanResponder>[0]> = {},
) {
  return createRatingPanResponder({
    getDisabled: () => false,
    getHasRating: () => true,
    getTrackWidth: () => TRACK_WIDTH,
    onPreviewChange: jest.fn(),
    onCommit: jest.fn(),
    onClear: jest.fn(),
    ...overrides,
  });
}

describe('createRatingPanResponder', () => {
  it('claims the responder on touch start and horizontal drags', () => {
    const { handlers } = createResponder();

    expect(handlers.shouldClaimOnStart()).toBe(true);
    expect(handlers.shouldClaimOnMove()).toBe(true);
  });

  it('does not claim the responder on touch start when disabled or blocked', () => {
    const disabled = createResponder({ getDisabled: () => true });
    const blocked = createResponder({ onGestureStart: () => false });

    expect(disabled.handlers.shouldClaimOnStart()).toBe(false);
    expect(blocked.handlers.shouldClaimOnStart()).toBe(false);
  });

  it('commits a tap without claiming the responder on touch start', () => {
    const onCommit = jest.fn();
    const { handlers } = createResponder({ onCommit });

    handlers.handleTouchEnd({ nativeEvent: { locationX: TRACK_WIDTH * 0.65, pageX: 0, pageY: 0 } });

    expect(onCommit).toHaveBeenCalledWith(3.5);
  });

  it('updates preview on grant without committing', () => {
    const onPreviewChange = jest.fn();
    const onCommit = jest.fn();
    const { handlers } = createResponder({ onPreviewChange, onCommit });

    handlers.handleGrant({ nativeEvent: { locationX: TRACK_WIDTH * 0.65, locationY: 0 } });

    expect(onPreviewChange).toHaveBeenCalledWith(3.5);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('updates preview during horizontal movement without committing', () => {
    const onPreviewChange = jest.fn();
    const onCommit = jest.fn();
    const { handlers } = createResponder({ onPreviewChange, onCommit });

    handlers.handleGrant({ nativeEvent: { locationX: TRACK_WIDTH * 0.2, locationY: 0 } });
    handlers.handleMove(
      { nativeEvent: { locationX: TRACK_WIDTH * 0.75, locationY: 0 } },
      { dx: 40, dy: 0 },
    );

    expect(onPreviewChange).toHaveBeenLastCalledWith(4);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('commits exactly once on release', () => {
    const onCommit = jest.fn();
    const { handlers } = createResponder({ onCommit });

    handlers.handleGrant({ nativeEvent: { locationX: TRACK_WIDTH * 0.65, locationY: 0 } });
    handlers.handleMove(
      { nativeEvent: { locationX: TRACK_WIDTH * 0.75, locationY: 0 } },
      { dx: 20, dy: 0 },
    );
    handlers.finishGesture(true);

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(4);
  });

  it('clears the rating when released in the left clear zone', () => {
    const onClear = jest.fn();
    const onCommit = jest.fn();
    const { handlers } = createResponder({
      getTrackWidth: () => TOUCH_TRACK_WIDTH,
      getStarClusterWidth: () => STAR_CLUSTER_WIDTH,
      onClear,
      onCommit,
    });

    handlers.handleGrant({ nativeEvent: { locationX: 2, locationY: 0 } });
    handlers.finishGesture(true);

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('does not clear when the left zone is used without an existing rating', () => {
    const onClear = jest.fn();
    const { handlers } = createResponder({
      getHasRating: () => false,
      getTrackWidth: () => TOUCH_TRACK_WIDTH,
      getStarClusterWidth: () => STAR_CLUSTER_WIDTH,
      onClear,
    });

    handlers.handleTouchEnd({ nativeEvent: { locationX: 2, pageX: 0, pageY: 0 } });

    expect(onClear).not.toHaveBeenCalled();
  });

  it('starts a rating at 0.5 stars from the inner left padding', () => {
    const onCommit = jest.fn();
    const { handlers } = createResponder({
      getTrackWidth: () => TOUCH_TRACK_WIDTH,
      getStarClusterWidth: () => STAR_CLUSTER_WIDTH,
      onCommit,
    });

    handlers.handleTouchEnd({ nativeEvent: { locationX: 7, pageX: 0, pageY: 0 } });

    expect(onCommit).toHaveBeenCalledWith(0.5);
  });

  it('notifies interaction lifecycle for scroll locking', () => {
    const onInteractionActiveChange = jest.fn();
    const { handlers } = createResponder({ onInteractionActiveChange });

    handlers.handleGrant({ nativeEvent: { locationX: TRACK_WIDTH * 0.5, locationY: 0 } });
    expect(onInteractionActiveChange).toHaveBeenCalledWith(true);

    handlers.finishGesture(true);
    expect(onInteractionActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('activates interaction lock on touch start before pan claims', () => {
    const onInteractionActiveChange = jest.fn();
    const { handlers, touchHandlers } = createResponder({ onInteractionActiveChange });

    touchHandlers.onTouchStart?.({
      nativeEvent: { pageX: 10, pageY: 10, locationX: 10, locationY: 0 },
    });

    expect(onInteractionActiveChange).toHaveBeenCalledWith(true);
    expect(handlers.getGestureMode()).toBe('pending');
  });

  it('releases interaction lock after a tap commit', () => {
    const onInteractionActiveChange = jest.fn();
    const onCommit = jest.fn();
    const { touchHandlers } = createResponder({ onInteractionActiveChange, onCommit });

    touchHandlers.onTouchStart?.({
      nativeEvent: { pageX: 10, pageY: 10, locationX: TRACK_WIDTH * 0.65, locationY: 0 },
    });
    touchHandlers.onTouchEnd?.({
      nativeEvent: { pageX: 10, pageY: 10, locationX: TRACK_WIDTH * 0.65, locationY: 0 },
    });

    expect(onCommit).toHaveBeenCalledWith(3.5);
    expect(onInteractionActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('releases scroll lock when vertical movement dominates', () => {
    const onInteractionActiveChange = jest.fn();
    const { handlers } = createResponder({ onInteractionActiveChange });

    handlers.handleGrant({ nativeEvent: { locationX: TRACK_WIDTH * 0.5, locationY: 0 } });
    handlers.handleMove(
      { nativeEvent: { locationX: TRACK_WIDTH * 0.5, locationY: 0 } },
      { dx: 0, dy: 12 },
    );

    expect(onInteractionActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('does not commit when vertical movement dominates', () => {
    const onCommit = jest.fn();
    const { handlers } = createResponder({ onCommit });

    handlers.handleGrant({ nativeEvent: { locationX: TRACK_WIDTH * 0.5, locationY: 0 } });
    handlers.handleMove(
      { nativeEvent: { locationX: TRACK_WIDTH * 0.5, locationY: 0 } },
      { dx: 0, dy: 12 },
    );
    handlers.finishGesture(true);

    expect(onCommit).not.toHaveBeenCalled();
  });

  it('submits backend score 7 when released at 3.5 stars', () => {
    const onCommit = jest.fn();
    const { handlers } = createResponder({ onCommit });

    handlers.handleGrant({ nativeEvent: { locationX: TRACK_WIDTH * 0.65, locationY: 0 } });
    handlers.finishGesture(true);

    expect(onCommit).toHaveBeenCalledWith(3.5);
  });

  it('does not commit when a gesture is cancelled', () => {
    const onCommit = jest.fn();
    const { handlers } = createResponder({ onCommit });

    handlers.handleGrant({ nativeEvent: { locationX: TRACK_WIDTH, locationY: 0 } });
    handlers.finishGesture(false);

    expect(onCommit).not.toHaveBeenCalled();
  });
});
