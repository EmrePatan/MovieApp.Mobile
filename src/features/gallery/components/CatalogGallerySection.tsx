import { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { GalleryResponse } from '../types';
import { getMovieTvPreviewImages } from '../utils/gallery-images';
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
    () => (query.data ? getMovieTvPreviewImages(query.data) : []),
    [query.data],
  );

  return (
    <GalleryPreviewSection
      title={title}
      images={images}
      isLoading={query.isPending && !query.isError}
      seeAllRoute={seeAllRoute}
    />
  );
}
