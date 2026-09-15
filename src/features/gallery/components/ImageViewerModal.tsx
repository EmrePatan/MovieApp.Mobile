import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { resolveOriginalImageUri } from '@/utils/image-url';
import type { GalleryImage } from '../types';
import { galleryImageKey } from '../utils/gallery-images';
import {
  shouldCaptureImageViewerDismissGesture,
  shouldDismissImageViewerOnRelease,
} from '../utils/image-viewer-dismiss-gesture';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface ImageViewerModalProps {
  visible: boolean;
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageViewerModal({
  visible,
  images,
  initialIndex,
  onClose,
}: ImageViewerModalProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(1)).current;

  const imageUris = useMemo(
    () => images.map((image) => resolveOriginalImageUri(image.filePath)),
    [images],
  );

  const resetDismissAnimation = useCallback(() => {
    translateY.setValue(0);
    backdropOpacity.setValue(1);
  }, [backdropOpacity, translateY]);

  const handleClose = useCallback(() => {
    resetDismissAnimation();
    onClose();
  }, [onClose, resetDismissAnimation]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          shouldCaptureImageViewerDismissGesture(gestureState.dx, gestureState.dy),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            backdropOpacity.setValue(Math.max(0.35, 1 - gestureState.dy / 280));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
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
                handleClose();
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
    [backdropOpacity, handleClose, height, translateY],
  );

  const handleMomentumEnd = useCallback(
    (offsetX: number) => {
      const nextIndex = Math.round(offsetX / width);
      setActiveIndex(Math.max(0, Math.min(nextIndex, images.length - 1)));
    },
    [images.length, width],
  );

  if (!visible || images.length === 0) {
    return null;
  }

  const closeButtonTop = Math.max(insets.top, spacing.sm) + spacing.sm;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
      testID="gallery-image-viewer"
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: backdropOpacity,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <FlatList
          horizontal
          pagingEnabled
          data={images}
          style={styles.list}
          keyExtractor={(image, index) => galleryImageKey(image, index)}
          initialScrollIndex={Math.min(initialIndex, images.length - 1)}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => handleMomentumEnd(event.nativeEvent.contentOffset.x)}
          renderItem={({ item, index }) => {
            const uri = imageUris[index];

            return (
              <View style={[styles.slide, { width, height }]}>
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="contain"
                    accessibilityLabel={`Gallery image ${index + 1}`}
                  />
                ) : (
                  <AppText variant="body" muted>
                    Image unavailable
                  </AppText>
                )}
              </View>
            );
          }}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close image viewer"
          onPress={handleClose}
          hitSlop={12}
          style={({ pressed }) => [
            styles.closeButton,
            { top: closeButtonTop, right: spacing.lg },
            pressed && styles.pressed,
          ]}
          testID="gallery-image-viewer-close"
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>

        <View
          pointerEvents="none"
          style={[styles.counterContainer, { bottom: insets.bottom + spacing.lg }]}
        >
          <AppText variant="caption" style={styles.counter}>
            {activeIndex + 1} / {images.length}
          </AppText>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.96)',
  },
  list: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    zIndex: 100,
    elevation: 100,
    width: interaction.touchTarget,
    height: interaction.touchTarget,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  counterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  counter: {
    color: colors.textPrimary,
    backgroundColor: 'rgba(10, 10, 15, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
