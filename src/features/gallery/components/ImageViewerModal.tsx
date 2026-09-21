import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { resolveOriginalImageUri } from '@/utils/image-url';
import { useImageViewerDismissGesture } from '../hooks/useImageViewerDismissGesture';
import {
  clampGalleryIndex,
  resolveGalleryActiveIndex,
} from '../utils/image-viewer-navigation';
import { ZoomableGalleryImage } from './ZoomableGalleryImage';
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
  const listRef = useRef<FlatList<GalleryImage>>(null);
  const isInitializingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    clampGalleryIndex(initialIndex, images.length),
  );
  const [pagingEnabled, setPagingEnabled] = useState(true);
  const dismissEnabled = useSharedValue(true);

  const {
    dismissGesture,
    animatedStyle,
    closeViewer,
    resetDismissState,
  } = useImageViewerDismissGesture({
    height,
    onClose,
    dismissEnabled,
  });

  const imageUris = useMemo(
    () => images.map((image) => resolveOriginalImageUri(image.filePath)),
    [images],
  );

  const syncActiveIndex = useCallback(
    (offsetX: number) => {
      const nextIndex = resolveGalleryActiveIndex(offsetX, width, images.length);
      setActiveIndex(nextIndex);
      dismissEnabled.value = true;
      setPagingEnabled(true);
    },
    [dismissEnabled, images.length, width],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isInitializingRef.current) {
        return;
      }

      syncActiveIndex(event.nativeEvent.contentOffset.x);
    },
    [syncActiveIndex],
  );

  const handleZoomChange = useCallback(
    (isZoomed: boolean) => {
      dismissEnabled.value = !isZoomed;
      setPagingEnabled(!isZoomed);
    },
    [dismissEnabled],
  );

  useEffect(() => {
    if (!visible || images.length === 0) {
      return;
    }

    const nextIndex = clampGalleryIndex(initialIndex, images.length);
    isInitializingRef.current = true;
    setActiveIndex(nextIndex);
    setPagingEnabled(true);
    dismissEnabled.value = true;
    resetDismissState();

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: nextIndex,
        animated: false,
      });

      requestAnimationFrame(() => {
        isInitializingRef.current = false;
      });
    });
  }, [images.length, initialIndex, visible]);

  const handleScrollToIndexFailed = useCallback(
    (info: { index: number }) => {
      listRef.current?.scrollToOffset({
        offset: width * info.index,
        animated: false,
      });
      setActiveIndex(clampGalleryIndex(info.index, images.length));
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
              ref={listRef}
              horizontal
              pagingEnabled
              scrollEnabled={pagingEnabled}
              data={images}
              style={styles.list}
              keyExtractor={(image, index) => galleryImageKey(image, index)}
              initialScrollIndex={clampGalleryIndex(initialIndex, images.length)}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              showsHorizontalScrollIndicator={false}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              windowSize={3}
              removeClippedSubviews
              onMomentumScrollEnd={handleScrollEnd}
              onScrollEndDrag={handleScrollEnd}
              onScrollToIndexFailed={handleScrollToIndexFailed}
              renderItem={({ item, index }) => {
                const uri = imageUris[index];

                return (
                  <View style={[styles.slide, { width, height }]}>
                    {uri ? (
                      <ZoomableGalleryImage
                        uri={uri}
                        isActive={index === activeIndex}
                        onZoomChange={handleZoomChange}
                        accessibilityLabel={t('gallery.imageAccessibility', { index: index + 1 })}
                      />
                    ) : (
                      <AppText variant="body" muted>
                        {t('gallery.imageUnavailable')}
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
              <AppText
                variant="caption"
                style={styles.counter}
                testID="gallery-image-viewer-counter"
              >
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
});
