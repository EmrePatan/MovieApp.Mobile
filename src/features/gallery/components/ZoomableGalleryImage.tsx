import { useCallback, useEffect } from 'react';
import { Image, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

interface ZoomableGalleryImageProps {
  uri: string;
  accessibilityLabel: string;
  isActive: boolean;
  onZoomChange: (isZoomed: boolean) => void;
}

export function ZoomableGalleryImage({
  uri,
  accessibilityLabel,
  isActive,
  onZoomChange,
}: ZoomableGalleryImageProps) {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const setZoomed = useCallback(
    (isZoomed: boolean) => {
      onZoomChange(isZoomed);
    },
    [onZoomChange],
  );

  const resetTransform = useCallback(() => {
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setZoomed(false);
  }, [savedScale, savedTranslateX, savedTranslateY, scale, setZoomed, translateX, translateY]);

  useEffect(() => {
    if (!isActive) {
      resetTransform();
    }
  }, [isActive, resetTransform]);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * event.scale));
      scale.value = nextScale;
      runOnJS(setZoomed)(nextScale > 1.01);
    })
    .onEnd(() => {
      if (scale.value <= 1.01) {
        runOnJS(resetTransform)();
        return;
      }

      savedScale.value = scale.value;
      runOnJS(setZoomed)(true);
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value <= 1.01) {
        return;
      }

      const maxTranslateX = ((scale.value - 1) * width) / 2;
      const maxTranslateY = ((scale.value - 1) * height) / 2;
      const nextX = savedTranslateX.value + event.translationX;
      const nextY = savedTranslateY.value + event.translationY;

      translateX.value = Math.min(maxTranslateX, Math.max(-maxTranslateX, nextX));
      translateY.value = Math.min(maxTranslateY, Math.max(-maxTranslateY, nextY));
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={accessibilityLabel}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
