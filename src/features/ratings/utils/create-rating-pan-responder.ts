import { GestureResponderEvent, PanResponder, PanResponderGestureState } from 'react-native';
import { resolveRatingGesturePosition } from './star-rating';
import {
  RATING_GESTURE_MOVE_THRESHOLD,
  type RatingGestureMode,
  resolveRatingGestureMode,
  shouldCommitRatingGesture,
} from './star-rating-gesture';

type RatingPreview = number | 'clear' | null;

interface CreateRatingPanResponderOptions {
  getDisabled: () => boolean;
  getHasRating: () => boolean;
  getTrackWidth: () => number;
  getStarClusterWidth?: () => number;
  onGestureStart?: () => boolean;
  onPreviewChange: (rating: RatingPreview) => void;
  onCommit: (rating: number) => void;
  onClear: () => void;
  onInteractionActiveChange?: (active: boolean) => void;
}

export function createRatingPanResponder({
  getDisabled,
  getHasRating,
  getTrackWidth,
  getStarClusterWidth,
  onGestureStart,
  onPreviewChange,
  onCommit,
  onClear,
  onInteractionActiveChange,
}: CreateRatingPanResponderOptions) {
  const previewRef = { current: null as RatingPreview };
  const gestureModeRef = { current: 'pending' as RatingGestureMode };
  const touchRef = {
    startPageX: 0,
    startPageY: 0,
    movedVertically: false,
    panGranted: false,
  };

  const resolvePosition = (localX: number) =>
    resolveRatingGesturePosition(
      localX,
      getTrackWidth(),
      getStarClusterWidth?.() ?? getTrackWidth(),
    );

  const setPreviewFromEvent = (event: GestureResponderEvent) => {
    const resolved = resolvePosition(event.nativeEvent.locationX);
    previewRef.current = resolved;
    onPreviewChange(resolved);
  };

  const commitResolvedPosition = (resolved: ReturnType<typeof resolvePosition>) => {
    if (resolved === 'clear') {
      if (getHasRating()) {
        onClear();
      }
      return;
    }

    onCommit(resolved);
  };

  const clearPreview = () => {
    previewRef.current = null;
    onPreviewChange(null);
  };

  const setInteractionActive = (active: boolean) => {
    onInteractionActiveChange?.(active);
  };

  const resetGesture = () => {
    gestureModeRef.current = 'pending';
    clearPreview();
  };

  const finishGesture = (shouldCommit: boolean) => {
    const finalRating = previewRef.current;
    const mode = gestureModeRef.current;
    setInteractionActive(false);
    resetGesture();

    if (shouldCommit && shouldCommitRatingGesture(mode) && finalRating != null) {
      commitResolvedPosition(finalRating);
    }
  };

  const handleGrant = (event: GestureResponderEvent) => {
    if (getDisabled()) {
      return;
    }

    if (onGestureStart && !onGestureStart()) {
      gestureModeRef.current = 'vertical';
      return;
    }

    touchRef.panGranted = true;
    gestureModeRef.current = 'pending';
    setInteractionActive(true);
    setPreviewFromEvent(event);
  };

  const handleTouchStart = (event: GestureResponderEvent) => {
    touchRef.startPageX = event.nativeEvent.pageX;
    touchRef.startPageY = event.nativeEvent.pageY;
    touchRef.movedVertically = false;
    touchRef.panGranted = false;
    gestureModeRef.current = 'pending';
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    const dx = Math.abs(event.nativeEvent.pageX - touchRef.startPageX);
    const dy = Math.abs(event.nativeEvent.pageY - touchRef.startPageY);

    if (dy >= RATING_GESTURE_MOVE_THRESHOLD && dy > dx) {
      touchRef.movedVertically = true;
    }
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    if (getDisabled() || touchRef.panGranted || touchRef.movedVertically) {
      return;
    }

    if (onGestureStart && !onGestureStart()) {
      return;
    }

    commitResolvedPosition(resolvePosition(event.nativeEvent.locationX));
  };

  const handleMove = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (getDisabled() || gestureModeRef.current === 'vertical') {
      return;
    }

    const nextMode = resolveRatingGestureMode(
      gestureModeRef.current,
      gestureState.dx,
      gestureState.dy,
    );

    if (nextMode === 'vertical') {
      gestureModeRef.current = 'vertical';
      setInteractionActive(false);
      clearPreview();
      return;
    }

    gestureModeRef.current = nextMode;
    setPreviewFromEvent(event);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      if (getDisabled()) {
        return false;
      }

      if (gestureModeRef.current === 'rating') {
        return true;
      }

      return resolveRatingGestureMode(
        gestureModeRef.current,
        gestureState.dx,
        gestureState.dy,
      ) === 'rating';
    },
    onPanResponderGrant: handleGrant,
    onPanResponderMove: handleMove,
    onPanResponderRelease: () => finishGesture(true),
    onPanResponderTerminate: () => finishGesture(false),
  });

  return {
    panHandlers: panResponder.panHandlers,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    handlers: {
      handleGrant,
      handleMove,
      handleTouchEnd,
      finishGesture,
      shouldClaimOnMove: () => !getDisabled(),
      getGestureMode: () => gestureModeRef.current,
    },
  };
}
