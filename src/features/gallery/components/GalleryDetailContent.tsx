import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import type { GalleryFilter, GalleryImage, GalleryResponse } from '../types';
import { getMovieTvGalleryImages, getPersonGalleryImages } from '../utils/gallery-images';
import { GalleryFilterTabs } from './GalleryFilterTabs';
import { GalleryGrid } from './GalleryGrid';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface GalleryDetailContentProps {
  gallery: GalleryResponse;
  mode: 'catalog' | 'person';
  subtitle?: string;
}

export function GalleryDetailContent({ gallery, mode, subtitle }: GalleryDetailContentProps) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('all');

  const images = useMemo<GalleryImage[]>(() => {
    if (mode === 'person') {
      return getPersonGalleryImages(gallery);
    }

    return getMovieTvGalleryImages(gallery, activeFilter);
  }, [activeFilter, gallery, mode]);

  return (
    <View style={styles.container} testID="gallery-detail-content">
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <DetailBackButton contentInset={false} />
        <View style={styles.header}>
          <AppText variant="title" style={styles.headerTitle}>
            {mode === 'person' ? t('details.sections.photos') : t('gallery.title')}
          </AppText>
          {subtitle ? (
            <AppText variant="bodySmall" muted numberOfLines={2}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </SafeAreaView>

      {mode === 'catalog' ? (
        <GalleryFilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      ) : null}

      <GalleryGrid key={mode === 'catalog' ? activeFilter : 'person'} images={images} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
  },
});
