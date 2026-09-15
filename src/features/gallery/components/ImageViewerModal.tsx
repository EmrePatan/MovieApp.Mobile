import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { resolveOriginalImageUri } from '@/utils/image-url';
import type { GalleryImage } from '../types';
import { galleryImageKey } from '../utils/gallery-images';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

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
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(initialIndex);

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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      testID="gallery-image-viewer"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.toolbar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close image viewer"
              onPress={onClose}
              hitSlop={8}
              testID="gallery-image-viewer-close"
            >
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
            <AppText variant="caption" style={styles.counter}>
              {activeIndex + 1} / {images.length}
            </AppText>
          </View>
        </SafeAreaView>

        <FlatList
          horizontal
          pagingEnabled
          data={images}
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
              <View style={[styles.slide, { width }]}>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.96)',
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  counter: {
    color: colors.textPrimary,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
