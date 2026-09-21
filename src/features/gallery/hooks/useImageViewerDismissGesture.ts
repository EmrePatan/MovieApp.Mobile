/* eslint-disable react-hooks/refs -- Animated.Value instances are held in refs by design */
import { useCallback, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, type SharedValue } from 'react-native-reanimated';
import {
  shouldCaptureImageViewerDismissGesture,
  shouldDismissImageViewerOnRelease,
} from '../utils/image-viewer-dismiss-gesture';

interface UseImageViewerDismissGestureOptions {
  height: number;
  onClose: () => void;
  dismissEnabled?: SharedValue<boolean>;
}

interface UseImageViewerDismissGestureResult {
  dismissGesture: ReturnType<typeof Gesture.Pan>;
  animatedStyle: {
    opacity: Animated.Value;
    transform: [{ translateY: Animated.Value }, { scale: Animated.AnimatedInterpolation<number> }];
  };
  closeViewer: () => void;
  resetDismissState: () => void;
}

export function useImageViewerDismissGesture({
  height,
  onClose,
  dismissEnabled,
}: UseImageViewerDismissGestureOptions): UseImageViewerDismissGestureResult {
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(1)).current;
  const dragOffsetRef = useRef(0);
  const isDismissingRef = useRef(false);
  const hasClosedRef = useRef(false);

  const resetDismissState = useCallback(() => {
    dragOffsetRef.current = 0;
    isDismissingRef.current = false;
    hasClosedRef.current = false;
    translateY.setValue(0);
    backdropOpacity.setValue(1);
  }, [backdropOpacity, translateY]);

  const finishClose = useCallback(() => {
    if (hasClosedRef.current) {
      return;
    }

    hasClosedRef.current = true;
    onClose();
  }, [onClose]);

  const updateDrag = useCallback(
    (offsetY: number) => {
      if (isDismissingRef.current || hasClosedRef.current) {
        return;
      }

      dragOffsetRef.current = offsetY;

      if (offsetY <= 0) {
        return;
      }

      translateY.setValue(offsetY);
      backdropOpacity.setValue(Math.max(0, 1 - offsetY / height));
    },
    [backdropOpacity, height, translateY],
  );

  const snapBack = useCallback(() => {
    if (isDismissingRef.current || hasClosedRef.current) {
      return;
    }

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 24,
        stiffness: 320,
        mass: 0.8,
      }),
      Animated.spring(backdropOpacity, {
        toValue: 1,
        useNativeDriver: true,
        damping: 24,
        stiffness: 320,
        mass: 0.8,
      }),
    ]).start();
  }, [backdropOpacity, translateY]);

  const dismissWithAnimation = useCallback(
    (offsetY = 0, velocityY = 0) => {
      if (isDismissingRef.current || hasClosedRef.current) {
        return;
      }

      isDismissingRef.current = true;

      const remainingDistance = Math.max(height - offsetY, 1);
      const velocityMagnitude = Math.max(Math.abs(velocityY), 900);
      const duration = Math.min(
        320,
        Math.max(200, (remainingDistance / velocityMagnitude) * 1000),
      );

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          finishClose();
          return;
        }

        isDismissingRef.current = false;
      });
    },
    [backdropOpacity, finishClose, height, translateY],
  );

  const handleRelease = useCallback(
    (offsetY: number, velocityY: number) => {
      if (isDismissingRef.current || hasClosedRef.current) {
        return;
      }

      if (shouldDismissImageViewerOnRelease(offsetY, velocityY)) {
        dismissWithAnimation(offsetY, velocityY);
        return;
      }

      snapBack();
    },
    [dismissWithAnimation, snapBack],
  );

  const dismissGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(8)
        .failOffsetX([-12, 12])
        .onUpdate((event) => {
          if (dismissEnabled && !dismissEnabled.value) {
            return;
          }

          if (
            !shouldCaptureImageViewerDismissGesture(
              event.translationX,
              event.translationY,
            )
          ) {
            return;
          }

          runOnJS(updateDrag)(event.translationY);
        })
        .onEnd((event) => {
          if (dismissEnabled && !dismissEnabled.value) {
            runOnJS(snapBack)();
            return;
          }

          if (
            !shouldCaptureImageViewerDismissGesture(
              event.translationX,
              event.translationY,
            )
          ) {
            runOnJS(snapBack)();
            return;
          }

          runOnJS(handleRelease)(event.translationY, event.velocityY);
        }),
    [dismissEnabled, handleRelease, snapBack, updateDrag],
  );

  const scale = useMemo(
    () =>
      translateY.interpolate({
        inputRange: [0, height],
        outputRange: [1, 0.94],
        extrapolate: 'clamp',
      }),
    [height, translateY],
  );

  const closeViewer = useCallback(() => {
    dismissWithAnimation(dragOffsetRef.current, 0);
  }, [dismissWithAnimation]);

  return {
    dismissGesture,
    animatedStyle: {
      opacity: backdropOpacity,
      transform: [{ translateY }, { scale }],
    },
    closeViewer,
    resetDismissState,
  };
}
