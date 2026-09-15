import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, type GestureResponderHandlers, PanResponder } from 'react-native';
import {
  shouldCaptureImageViewerDismissGesture,
  shouldDismissImageViewerOnRelease,
} from '../utils/image-viewer-dismiss-gesture';

interface UseImageViewerDismissGestureOptions {
  height: number;
  onClose: () => void;
}

interface UseImageViewerDismissGestureResult {
  panHandlers: GestureResponderHandlers;
  pagerScrollEnabled: boolean;
  animatedStyle: {
    opacity: Animated.Value;
    transform: [{ translateY: Animated.Value }];
  };
  closeViewer: () => void;
}

export function useImageViewerDismissGesture({
  height,
  onClose,
}: UseImageViewerDismissGestureOptions): UseImageViewerDismissGestureResult {
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(1)).current;
  const [pagerScrollEnabled, setPagerScrollEnabled] = useState(true);
  const isDismissDraggingRef = useRef(false);

  const resetDismissAnimation = useCallback(() => {
    translateY.setValue(0);
    backdropOpacity.setValue(1);
  }, [backdropOpacity, translateY]);

  const closeViewer = useCallback(() => {
    resetDismissAnimation();
    onClose();
  }, [onClose, resetDismissAnimation]);

  const endDismissDrag = useCallback(() => {
    isDismissDraggingRef.current = false;
    setPagerScrollEnabled(true);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          shouldCaptureImageViewerDismissGesture(gestureState.dx, gestureState.dy),
        onMoveShouldSetPanResponder: (_, gestureState) =>
          shouldCaptureImageViewerDismissGesture(gestureState.dx, gestureState.dy),
        onPanResponderTerminationRequest: () => !isDismissDraggingRef.current,
        onPanResponderGrant: () => {
          isDismissDraggingRef.current = true;
          setPagerScrollEnabled(false);
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            backdropOpacity.setValue(Math.max(0.35, 1 - gestureState.dy / 280));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          endDismissDrag();

          if (shouldDismissImageViewerOnRelease(gestureState.dy, gestureState.vy)) {
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: height * 0.35,
                duration: 180,
                useNativeDriver: true,
              }),
              Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
              }),
            ]).start(({ finished }) => {
              if (finished) {
                closeViewer();
              }
            });
            return;
          }

          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 0,
            }),
            Animated.spring(backdropOpacity, {
              toValue: 1,
              useNativeDriver: true,
              bounciness: 0,
            }),
          ]).start();
        },
        onPanResponderTerminate: () => {
          endDismissDrag();

          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 0,
            }),
            Animated.spring(backdropOpacity, {
              toValue: 1,
              useNativeDriver: true,
              bounciness: 0,
            }),
          ]).start();
        },
      }),
    [backdropOpacity, closeViewer, endDismissDrag, height, translateY],
  );

  return {
    panHandlers: panResponder.panHandlers,
    pagerScrollEnabled,
    animatedStyle: {
      opacity: backdropOpacity,
      transform: [{ translateY }],
    },
    closeViewer,
  };
}
