import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import type { GalleryResponse } from '../types';
import { getMovieTvGalleryImages } from '../utils/gallery-images';
import { GalleryPreviewSection } from './GalleryPreviewSection';

interface CatalogGallerySectionProps {
  query: UseQueryResult<GalleryResponse>;
  seeAllRoute: string;
  title?: string;
}

export function CatalogGallerySection({
  query,
  seeAllRoute,
  title,
}: CatalogGallerySectionProps) {
  const { t } = useTranslation();
  const images = useMemo(
    () => (query.data ? getMovieTvGalleryImages(query.data, 'all') : []),
    [query.data],
  );

  return (
    <GalleryPreviewSection
      title={title ?? t('details.sections.photos')}
      images={images}
      isLoading={query.isPending && !query.isError}
      seeAllRoute={seeAllRoute}
    />
  );
}
