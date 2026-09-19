import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { resolveOriginalImageUri } from '@/utils/image-url';
import { useImageViewerDismissGesture } from '../hooks/useImageViewerDismissGesture';
import type { GalleryImage } from '../types';
import { galleryImageKey } from '../utils/gallery-images';
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
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const {
    dismissGesture,
    animatedStyle,
    closeViewer,
  } = useImageViewerDismissGesture({
    height,
    onClose,
  });

  const imageUris = useMemo(
    () => images.map((image) => resolveOriginalImageUri(image.filePath)),
    [images],
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
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={closeViewer}
      testID="gallery-image-viewer"
    >
      <GestureHandlerRootView style={styles.root}>
        <GestureDetector gesture={dismissGesture}>
          <Animated.View style={[styles.overlay, animatedStyle]}>
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
              accessibilityLabel={t('gallery.closeImageViewer')}
              onPress={closeViewer}
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
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
