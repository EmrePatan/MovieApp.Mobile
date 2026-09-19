/* eslint-disable react-hooks/refs -- Animated.Value instances are held in refs by design */
import { useCallback, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { shouldDismissImageViewerOnRelease } from '../utils/image-viewer-dismiss-gesture';

interface UseImageViewerDismissGestureOptions {
  height: number;
  onClose: () => void;
  enabled?: () => boolean;
}

interface UseImageViewerDismissGestureResult {
  dismissGesture: ReturnType<typeof Gesture.Pan>;
  animatedStyle: {
    opacity: Animated.Value;
    transform: [{ translateY: Animated.Value }, { scale: Animated.AnimatedInterpolation<number> }];
  };
  closeViewer: () => void;
}

export function useImageViewerDismissGesture({
  height,
  onClose,
  enabled,
}: UseImageViewerDismissGestureOptions): UseImageViewerDismissGestureResult {
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(1)).current;
  const dragOffsetRef = useRef(0);

  const finishClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const updateDrag = useCallback(
    (offsetY: number) => {
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
        }
      });
    },
    [backdropOpacity, finishClose, height, translateY],
  );

  const handleRelease = useCallback(
    (offsetY: number, velocityY: number) => {
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
          if (enabled && !enabled()) {
            return;
          }

          runOnJS(updateDrag)(event.translationY);
        })
        .onEnd((event) => {
          if (enabled && !enabled()) {
            runOnJS(snapBack)();
            return;
          }

          runOnJS(handleRelease)(event.translationY, event.velocityY);
        }),
    [enabled, handleRelease, snapBack, updateDrag],
  );

  const scale = translateY.interpolate({
    inputRange: [0, height],
    outputRange: [1, 0.94],
    extrapolate: 'clamp',
  });

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
  };
}
