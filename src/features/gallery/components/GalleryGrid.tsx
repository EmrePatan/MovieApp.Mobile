import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppText } from '@/components/common/AppText';
import { resolveThumbnailImageUri } from '@/utils/image-url';
import type { GalleryImage } from '../types';
import { galleryImageKey } from '../utils/gallery-images';
import { ImageViewerModal } from './ImageViewerModal';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const GRID_COLUMNS = 3;
const GRID_GAP = spacing.sm;

interface GalleryGridProps {
  images: GalleryImage[];
  emptyMessage?: string;
}

export function GalleryGrid({
  images,
  emptyMessage = 'No photos are available yet.',
}: GalleryGridProps) {
  const { width } = useWindowDimensions();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const itemSize = useMemo(
    () => (width - spacing.lg * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
    [width],
  );

  const handlePress = useCallback((index: number) => {
    setViewerIndex(index);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  if (images.length === 0) {
    return (
      <View style={styles.empty} testID="gallery-empty">
        <AppText variant="bodySmall" muted>
          {emptyMessage}
        </AppText>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={images}
        keyExtractor={(image, index) => galleryImageKey(image, index)}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        testID="gallery-grid"
        renderItem={({ item, index }) => {
          const uri = resolveThumbnailImageUri(item.filePath);
          const aspectRatio = item.aspectRatio && item.aspectRatio > 0 ? item.aspectRatio : 0.67;
          const height = itemSize / aspectRatio;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open gallery image ${index + 1}`}
              onPress={() => handlePress(index)}
              style={[styles.item, { width: itemSize, height }]}
              testID={`gallery-grid-item-${index}`}
            >
              {uri ? (
                <Image source={{ uri }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.placeholder} />
              )}
            </Pressable>
          );
        }}
      />

      <ImageViewerModal
        visible={viewerIndex !== null}
        images={images}
        initialIndex={viewerIndex ?? 0}
        onClose={handleCloseViewer}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
  },
  item: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
});
