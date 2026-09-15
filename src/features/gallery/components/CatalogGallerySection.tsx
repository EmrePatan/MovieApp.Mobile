import { useMemo } from 'react';
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
  title = 'Photos',
}: CatalogGallerySectionProps) {
  const images = useMemo(
    () => (query.data ? getMovieTvGalleryImages(query.data, 'all') : []),
    [query.data],
  );

  return (
    <GalleryPreviewSection
      title={title}
      images={images}
      isLoading={query.isLoading}
      seeAllRoute={seeAllRoute}
    />
  );
}
