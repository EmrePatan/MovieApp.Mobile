import { useCallback, useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { shouldDismissImageViewerOnRelease } from '../utils/image-viewer-dismiss-gesture';

interface UseImageViewerDismissGestureOptions {
  height: number;
  onClose: () => void;
}

interface UseImageViewerDismissGestureResult {
  dismissGesture: ReturnType<typeof Gesture.Pan>;
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

  const resetDismissAnimation = useCallback(() => {
    translateY.setValue(0);
    backdropOpacity.setValue(1);
  }, [backdropOpacity, translateY]);

  const closeViewer = useCallback(() => {
    resetDismissAnimation();
    onClose();
  }, [onClose, resetDismissAnimation]);

  const updateDrag = useCallback(
    (offsetY: number) => {
      if (offsetY > 0) {
        translateY.setValue(offsetY);
        backdropOpacity.setValue(Math.max(0.35, 1 - offsetY / 280));
      }
    },
    [backdropOpacity, translateY],
  );

  const snapBack = useCallback(() => {
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
  }, [backdropOpacity, translateY]);

  const dismissWithAnimation = useCallback(() => {
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
  }, [backdropOpacity, closeViewer, height, translateY]);

  const handleRelease = useCallback(
    (offsetY: number, velocityY: number) => {
      if (shouldDismissImageViewerOnRelease(offsetY, velocityY)) {
        dismissWithAnimation();
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
          runOnJS(updateDrag)(event.translationY);
        })
        .onEnd((event) => {
          runOnJS(handleRelease)(event.translationY, event.velocityY);
        }),
    [handleRelease, updateDrag],
  );

  return {
    dismissGesture,
    animatedStyle: {
      opacity: backdropOpacity,
      transform: [{ translateY }],
    },
    closeViewer,
  };
}
