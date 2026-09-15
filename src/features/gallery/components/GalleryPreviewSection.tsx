import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { openGalleryDetail } from '@/features/details/shared/navigation/gallery-detail-navigation';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { resolveThumbnailImageUri } from '@/utils/image-url';
import type { GalleryImage } from '../types';
import { galleryImageKey, getGalleryPreviewImages } from '../utils/gallery-images';
import { ImageViewerModal } from './ImageViewerModal';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const PREVIEW_SIZE = 112;

interface GalleryPreviewSectionProps {
  title: string;
  images: GalleryImage[];
  isLoading?: boolean;
  seeAllRoute?: string;
  returnHref?: string;
}

export function GalleryPreviewSection({
  title,
  images,
  isLoading = false,
  seeAllRoute,
  returnHref,
}: GalleryPreviewSectionProps) {
  const router = useRouter();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const previewImages = useMemo(() => getGalleryPreviewImages(images), [images]);

  const handleSeeAllPress = useCallback(() => {
    if (seeAllRoute && returnHref) {
      openGalleryDetail(router, seeAllRoute, returnHref);
      return;
    }

    if (seeAllRoute) {
      router.push(seeAllRoute);
    }
  }, [returnHref, router, seeAllRoute]);

  const handleImagePress = useCallback((index: number) => {
    setViewerIndex(index);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container} testID="gallery-preview-loading">
        <HomeSectionHeader title={title} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock
              key={`gallery-preview-skeleton-${index}`}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE * 0.67}
              style={styles.previewItem}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (previewImages.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID="gallery-preview">
      <HomeSectionHeader
        title={title}
        onSeeAllPress={seeAllRoute ? handleSeeAllPress : undefined}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {previewImages.map((item, index) => {
          const uri = resolveThumbnailImageUri(item.filePath);
          const aspectRatio = item.aspectRatio && item.aspectRatio > 0 ? item.aspectRatio : 0.67;
          const height = PREVIEW_SIZE / aspectRatio;

          return (
            <Pressable
              key={galleryImageKey(item, index)}
              accessibilityRole="button"
              accessibilityLabel={`Gallery preview image ${index + 1}`}
              onPress={() => handleImagePress(index)}
              style={[styles.previewItem, { width: PREVIEW_SIZE, height }]}
              testID={`gallery-preview-item-${index}`}
            >
              {uri ? (
                <Image source={{ uri }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.placeholder} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {viewerIndex !== null ? (
        <ImageViewerModal
          visible
          images={images}
          initialIndex={viewerIndex}
          onClose={handleCloseViewer}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
  },
  previewItem: {
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
});
