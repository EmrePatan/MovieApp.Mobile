import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  logRouteLayoutMeta,
  routeLayoutHandler,
  type RouteLayoutContext,
} from '@/debug/route-layout-probe';
import { ImageViewerModal } from './ImageViewerModal';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const GRID_COLUMNS = 3;
const GRID_GAP = spacing.sm;

interface GalleryGridProps {
  images: GalleryImage[];
  emptyMessage?: string;
  layoutScope?: string;
  route?: RouteLayoutContext;
}

export function GalleryGrid({
  images,
  emptyMessage,
  layoutScope,
  route,
}: GalleryGridProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const resolvedEmptyMessage = emptyMessage ?? t('gallery.empty');
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
          {resolvedEmptyMessage}
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
        onLayout={
          layoutScope && route
            ? routeLayoutHandler(layoutScope, 'list', route, {
                renderer: 'FlatList',
                dataCount: images.length,
                numColumns: GRID_COLUMNS,
              })
            : undefined
        }
        renderItem={({ item, index }) => {
          const uri = resolveThumbnailImageUri(item.filePath);
          const aspectRatio = item.aspectRatio && item.aspectRatio > 0 ? item.aspectRatio : 0.67;
          const height = itemSize / aspectRatio;

          if (__DEV__ && index === 0 && layoutScope && route) {
            logRouteLayoutMeta(layoutScope, route, {
              renderItemIndex0: true,
              itemComponent: 'Pressable+Image',
            });
          }

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('gallery.openImageAccessibility', { index: index + 1 })}
              onPress={() => handlePress(index)}
              style={[styles.item, { width: itemSize, height }]}
              testID={`gallery-grid-item-${index}`}
              onLayout={
                index === 0 && layoutScope && route
                  ? routeLayoutHandler(layoutScope, 'item:index0', route, {
                      itemComponent: 'Pressable+Image',
                    })
                  : undefined
              }
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

      {viewerIndex !== null ? (
        <ImageViewerModal
          visible
          images={images}
          initialIndex={viewerIndex}
          onClose={handleCloseViewer}
        />
      ) : null}
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
