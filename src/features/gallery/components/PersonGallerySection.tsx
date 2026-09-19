import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import type { GalleryResponse } from '../types';
import { getPersonGalleryImages } from '../utils/gallery-images';
import { GalleryPreviewSection } from './GalleryPreviewSection';

interface PersonGallerySectionProps {
  query: UseQueryResult<GalleryResponse>;
  seeAllRoute: string;
}

export function PersonGallerySection({ query, seeAllRoute }: PersonGallerySectionProps) {
  const { t } = useTranslation();
  const images = useMemo(
    () => (query.data ? getPersonGalleryImages(query.data) : []),
    [query.data],
  );

  return (
    <GalleryPreviewSection
      title={t('details.sections.photos')}
      images={images}
      isLoading={query.isPending && !query.isError}
      seeAllRoute={seeAllRoute}
    />
  );
}
